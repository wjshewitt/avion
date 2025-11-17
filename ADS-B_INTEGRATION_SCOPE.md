# ADS-B Live Tracking & Operational Intelligence Scope

## 1. Mission Objectives
- **Situational truth**: Track every managed aircraft from T-24h through arrival touchdown, surfacing live position, phase, and ETA accuracy.
- **Operational intelligence**: Detect schedule deviations, crew duty risks, regulatory conflicts (night ops, customs), and recommend next best actions.
- **AI co-pilot enablement**: Power conversational queries ("Where is XA-ABC?", "Nearest alternate right now?") plus proactive alerts inside Mission Control.
- **Redundant coverage**: Blend multiple ADS-B feeds so outages or rate limits never blind dispatchers.

## 2. Provider Strategy & Redundancy
| Priority | Provider | Access Notes | Strengths | Caveats |
| --- | --- | --- | --- | --- |
| P1 | ADS-B Exchange API (Lite → Enterprise) | UUID auth; enterprise SLAs for commercial use | Unfiltered global feed, endpoints by lat/lon/callsign/icao24, 5s historical traces | Need paid tier for production; respect TOS citing requirements |
| P2 | OpenSky Network | Free REST (`/states/all`, `/flights/aircraft`) no auth | Easy onboarding, historical query support, community sensors | Lower refresh; community rate limits; partial MLAT |
| P3 | airplanes.live | Request-based key, 1 req/sec base, commercial licensing | Clean REST JSON, bounding box queries, strong EU coverage | Access approval + stricter limits |
| P4 | AeroDataBox / AviationStack | Paid API | Adds ETA forecasts, airport meta, schedules | Not raw ADS-B; use for enrichment/fallback |

**Coordinator behavior**:
1. Health monitor tracks latency/error budget per provider.
2. Real-time fetch requests primary provider first; fail over if unhealthy or rate limited.
3. Cache per-provider responses separately (`state:{source}:{icao24}`) so stale data serves while retrying others.

## 3. Data Architecture
### 3.1 Persistent Entities
1. `countries` – ISO 3166-1 alpha-2, localized names, regulatory metadata pointer.
2. `airports` – FK → `countries`, include `night_ops_allowed`, `curfew_windows`, `customs_requirements`.
3. `operators` – FK → `countries`, `operation_type` (Part 91/135), `reliability_score`, `fleet_ids`.
4. `aircraft` – `icao24`, `registration`, `type_designator`, `operator_id`, `home_base_airport_id`, `crew_profile` (min crew, duty cap), `range_nm`.
5. `flights` – extend with `aircraft_id`, `scheduled_out/in`, `estimated_out/in`, `actual_out/in`, `status_reason`, `regulatory_flags` (JSONB), `duty_risk_score`.
6. `flight_tracking_sessions` – `flight_id`, `provider`, `tracking_window_start/end`, `state` (pending/active/error), `last_poll_at`, `next_poll_at`, `poll_interval_sec`.
7. `aircraft_positions` – timeseries table storing `session_id`, `timestamp`, `lat`, `lon`, `geo_alt_ft`, `groundspeed_kt`, `heading_deg`, `vertical_rate`, `on_ground`, `source`, `confidence`.
8. `aircraft_day_metrics` – 24h summarized block time, legs count, duty rest windows, last known location (for pre-flight analytics).

### 3.2 Caching Layers
- **Hot state cache** (Redis/Upstash): `aircraft:state:{icao24}` TTL 30s for UI/AI queries.
- **Trace ring buffer**: in-memory (or Redis streams) storing latest N samples (~120) per active flight for quick map playback.
- **Provider health cache**: `adsb:health:{provider}` with rolling success/failure counts to drive failover.

### 3.3 Retention Policy
- Raw telemetry persisted at 5–10s cadence for active flights; downsampled to 60s after 24h.
- Archive >30d traces to cold storage (S3) for analytics/compliance.
- Operator reliability scores recalculated nightly using last 30d actual vs scheduled metrics.

## 4. Tracking Pipeline
1. **Flight onboarding**
   - When flight created or aircraft reg added, resolve `icao24` (via registry API or manual override) and ensure `aircraft`, `operator`, `tracking_session` rows exist.
   - Forecast tracking window: T-24h to scheduled arrival + 3h buffer.

2. **Scheduler / Worker Design**
   - `TrackActiveFlights` job runs every minute:
     1. Query flights with `scheduled_out` between now-6h and now+24h or `status` in {TAXI, AIRBORNE, DIVERTED}.
     2. For each, request latest state via provider coordinator.
     3. Derive phase using groundspeed + altitude heuristics (e.g., `on_ground && speed > 20kt → taxi`).
     4. Persist sample (respect rate to avoid DB bloat by limiting to 10s cadence) and update caches.
     5. Update `flights` table fields: `actual_out`, `estimated_in`, `status`, `status_reason` (e.g., `AUTO_DELAY_NO_DEPARTURE`).
     6. If no movement 10 min past ETD → mark delayed and enqueue notification.

3. **Pre-flight 24h Analytics**
   - Separate job `SummarizeAircraftDay` runs hourly to grab last 24h samples per aircraft, computing:
     - Number of legs + durations.
     - Time since home base or rest.
     - Duty risk score (thresholded vs crew profile) stored on upcoming flights.

4. **ETA Intelligence**
   - Use remaining great-circle distance (Haversine) / groundspeed to compute raw ETA.
   - Blend with provider-supplied ETA (AeroDataBox) + runway/ATC constraints.
   - Convert to local time zone and compare with airport curfews.

5. **Alternate Finder**
   - On demand (AI tool or UI button): search airports within radius of current position filtered by runway length ≥ aircraft requirement, services (fuel/customs), and weather minima.
   - Cache results per aircraft for 5 min to avoid repeated heavy queries.

## 5. Regulatory & Country Normalization
- Central `countries` table ensures single source for ISO codes, names, ICAO prefixes, region membership.
- `country_regulations` outlines night restrictions, cabotage, customs, duty rules; keyed by country and optionally airport overrides.
- During tracking/planning:
  - Map flight origin/destination to country via airport FK.
  - Evaluate rules: e.g., if ETA local within `curfew_windows` and `night_ops_allowed=false`, flag `regulatory_flags -> night_curfew_violation`.
  - Extend to region-specific mandates (EU ETS, US APIS) as needed.

## 6. Operator Reliability Intelligence
- Compute rolling metrics per operator: on-time %, average delay, cancellation rate, diversion rate, duty-risk occurrences.
- Display reliability badge in Mission Control; expose to AI prompts for context ("Operator VistaJet running 92% on-time past 30d").
- Use for predictive heuristics (e.g., escalate alerts sooner for unreliable operators).

## 7. AI & UX Touchpoints
1. **AI Tools**
   - `get_aircraft_position` – returns latest cached telemetry, provider source, ETA, phase.
   - `get_aircraft_history` – summarized 24h legs, duty score, previous delays.
   - `suggest_alternate_airports` – uses current position + aircraft profile + regulation data.

2. **Prompt Context Injection**
   - When chat initiated from flight detail/mission control, include live snapshot (position, ETA, regulatory alerts) so responses reference real-time facts.

3. **Mission Control UI**
   - Flight cards show live sparkline, status badges (AUTO-DELAY, NIGHT RISK), reliability indicator.
   - Detail drawer includes timeline comparing scheduled vs actual, map playback slider, alternate recommendations.
   - Notification center ties into existing settings (email/SMS/push) triggered by auto-detected delays/diversions/duty risk.

## 8. Implementation Phases
### Phase A – Framework
1. Build provider adapters + health monitor + caching.
2. Add DB migrations for core entities (countries, operators, aircraft, tracking sessions, positions).
3. Hook flight creation to aircraft registry + session setup.
4. Implement baseline tracking worker using OpenSky data; update flight statuses + expose simple live badge.

### Phase B – Operational Layer
1. Persist 24h traces + compute duty metrics + operator reliability scores.
2. Normalize regulations/countries; add alert evaluation service.
3. Integrate ADS-B Exchange for richer coverage + fallback logic; add airplanes.live key for redundancy.
4. Surface alerts + live map in UI; wire notification triggers.

### Phase C – Intelligent Layer
1. Add AI tools + prompt context; enable queries within chat.
2. Build alternate suggestion service using runway/weather/regulation data.
3. Introduce predictive ETA adjustments blending telemetry + historical trends.
4. Create dashboards for provider health, operator reliability, duty risks.

### Phase D – Advanced Automation
1. Auto-generate pre-flight briefs including last 24h aircraft utilization and regulatory considerations.
2. Add anomaly detection (holding, diversion probability) to proactively ping dispatchers.
3. Expand regulation engine for region-specific requirements (US Customs, EU cabotage, etc.).
4. Explore partnership with premium providers (AeroDataBox) for guaranteed SLAs if needed.

## 9. Open Questions
1. What is the target scale (simultaneously tracked aircraft) to size cache/DB throughput?
2. Which provider terms allow commercial resale vs internal ops only? Need legal review.
3. Preferred infra for workers (Next.js cron, Supabase Edge Functions, separate queue workers)?
4. How to reconcile telemetry gaps (privacy blocking, oceanic coverage)? Need fallback heuristics.
5. What regulatory datasets already exist internally to avoid duplication when normalizing countries?

## 10. Next Steps Checklist
- [ ] Confirm provider licensing path + secure credentials.
- [ ] Approve DB schema changes & migration plan.
- [ ] Choose cache + worker infrastructure.
- [ ] Prioritize UI/AI deliverables for first milestone.
- [ ] Draft runbooks for monitoring provider health + handling outages.
