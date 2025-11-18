# Flight Risk Engine v2: Research & Specification

## 1. Overview
The Flight Risk Engine v2 is designed to transform a purely weather-based scoring system into a multi-dimensional operational risk model. Its primary goal is to provide explainable, actionable intelligence regarding **timing reliability** (delay risk) and **mission feasibility** (cancellation risk), while maintaining a strong safety baseline.

## 2. Database-Backed Risk Variables
The model draws from the following data surfaces:

### 2.1 Flight Context (`user_flights`)
*   **`scheduled_at`, `arrival_at`**: Defines the flight phase (Preflight, Planning, Departure, Enroute, Arrival) and buffer times.
*   **`origin_icao`, `destination_icao`**: Links to airport capabilities and local weather.
*   **`status`**: 'On Time' | 'Delayed' | 'Cancelled'. Serves as a hard override for risk outputs.
*   **`weather_risk_score`**: Historical tracking of risk trajectory.

### 2.2 Weather Infrastructure (`weather_cache`)
*   **`data_type`**: 'metar_decoded' | 'taf_decoded'.
*   **`weather_data`**: Raw JSON payload used for granular factor analysis.
*   **Data Age**: Critical for confidence modeling.

### 2.3 Airport & Runway Context (`airport_cache`)
*   **Runway Length**: `longest_ft` vs aircraft requirements (future).
*   **Approaches**: Presence of ILS/Precision approaches vs ceiling/vis conditions.
*   **Type**: Scheduled service presence (proxy for snow removal/de-icing readiness).

### 2.4 Compliance (`flight_compliance_entries`)
*   **Regulatory Gaps**: Missing permits or equipment mandates that increase administrative cancellation risk.

## 3. Risk Model v2: Design

### 3.1 Dimensions & Factors
Risk is aggregated across distinct **Dimensions**. Each dimension contains specific **Factors**.

| Dimension | Factor ID | Description |
| :--- | :--- | :--- |
| **Weather** | `surface_wind` | Crosswind/Headwind limits, gusts. |
| | `visibility` | Approach and taxi operations. |
| | `ceiling_clouds` | IFR/LIFR conditions vs approach mins. |
| | `precipitation` | Freezing rain (high cancel risk), Snow, TS. |
| | `trend_stability` | Deteriorating forecast vs arrival window. |
| | `hazard_advisories`| SIGMET/AIRMET (Turbulence, Icing, Convection). |
| | `temperature` | Density altitude or extreme cold ops. |
| **Schedule** | `schedule_buffer` | Proximity to departure (risk increases as time shortens). |
| **Runway** | `runway_performance`| (Future) Required vs Available distance. |
| | `airport_capability`| (Future) ILS availability vs Weather. |
| **Compliance**| `compliance_gap` | (Future) Open regulatory items. |

### 3.2 Configuration Model
The system supports **User Risk Profiles** which adjust the weight of specific factors.

**Profile Types:**
*   **Standard**: Balanced approach. Default weights.
*   **Conservative**: Higher penalty for adverse weather. Prefers early cancellation over "wait and see".
    *   *Effect*: Weights for `ceiling_clouds`, `precipitation`, `hazards` increased by ~20-30%.
*   **Aggressive**: Higher tolerance for marginal conditions. Prioritizes mission completion.
    *   *Effect*: Weights for `visibility`, `ceiling` slightly reduced. `schedule_buffer` weight increased (late decisions).

**JSON Structure (stored in `user_profiles.preferences`):**
```json
{
  "risk_model_v2": {
    "profile": "conservative",
    "custom_weights": {
      "surface_wind": 1.2
    },
    "disabled_factors": ["temperature"]
  }
}
```

### 3.3 Aggregation Logic
1.  **Base Score**: Calculate 0-100 score for each factor (as per v1).
2.  **Weighting**:
    *   `EffectiveWeight = DefaultWeight * ProfileMultiplier * UserOverride`
    *   Normalize weights across all active factors.
3.  **Weighted Sum**: `Sum(Score * EffectiveWeight)`.
4.  **Safety Rails**: If any *single* factor is "Critical" (Score > 90), the Total Score cannot be below 60 (Monitor).

## 4. Timing & Cancellation Modelling
We derive probabilistic metrics from the Score + Factor Mix.

### 4.1 Delay Probability
Likelihood of departure or arrival delay > 15 mins.
*   **Low Risk (0-30)**: ~5%
*   **Moderate (31-60)**: ~25%
*   **High (61-80)**: ~60%
*   **Severe (>80)**: ~90%

**Modifiers:**
*   *Enroute Hazards*: Increase Delay Prob (reroutes), low impact on Cancellation.
*   *Low Cigs/Vis*: Moderate impact on Delay (spacing), high impact on Cancellation if below mins.

### 4.2 Cancellation Probability
Likelihood of flight not operating on the scheduled day.
*   **Low Risk**: < 1%
*   **Moderate**: ~5%
*   **High**: ~20%
*   **Severe**: > 50%

**Drivers:**
*   **Freezing Precip**: Massive multiplier (3x) for Cancellation.
*   **LIFR at Destination**: 2x multiplier if airport has no ILS.

## 5. Implementation Plan
1.  **Types**: Define `RiskProfile`, `RiskModelConfig`.
2.  **Config**: Implement `resolveRiskConfig`.
3.  **Aggregation**: Refactor `aggregateRisk` to use weights and compute disruption metrics.
4.  **Onboarding**: Add Risk Preference step to wizard.
