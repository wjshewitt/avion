# ADS-B Integration Specification

## 1. Architecture Overview
We will implement a **Hybrid Data Strategy** to achieve professional-grade flight tracking with minimal operating costs.

### Data Sources
1.  **Live Positions (The "Dots")**: **Airplanes.live**
    *   **Role**: High-frequency (1Hz) stream of aircraft positions (Lat/Lon/Alt/Speed/Heading).
    *   **Cost**: Free/Low-cost for commercial use (donation-based/contact for terms).
    *   **Integration**: Client-side polling (via Next.js API proxy) for active regions; Server-side background polling for specific tracked flights.

2.  **Aircraft Metadata (The "Details")**: **ADS-B DB** (adsbdb.com)
    *   **Role**: Resolving Mode S Hex Codes (e.g., `A835AF`) to Static Info (Tail `N12345`, Type `B737`, Owner `Delta`).
    *   **Cost**: Free Open Source API.
    *   **Integration**: On-demand fetch when a flight is selected or first seen; cached in Supabase `aircraft` table.

3.  **Flight Schedule (The "Context")**: **AeroDataBox** (RapidAPI)
    *   **Role**: "Real" schedule data (Gate, Terminal, Delays, Scheduled vs Actual times).
    *   **Cost**: Pay-per-use (via RapidAPI).
    *   **Integration**: Fetched only for *focused* flights to conserve quota.

## 2. Database Schema (Supabase)

### 2.1 Extensions
*   Enable **PostGIS** for spatial queries.
    ```sql
    CREATE EXTENSION IF NOT EXISTS postgis;
    ```

### 2.2 Tables

**`public.airports` (Update)**
*   Add `geog` column (Geography point) for performant "nearest" queries.
*   *Note*: Existing `lat`/`lon` columns remain for UI, but `geog` drives logic.

**`public.aircraft` (New/Update)**
*   Central registry of known airframes.
*   Columns: `icao24` (PK), `registration`, `type_code`, `manufacturer`, `model`, `owner`, `image_url`.
*   Populated lazily via **ADS-B DB**.

**`public.live_tracking` (New - Ephemeral)**
*   Stores the *latest* known state of tracked aircraft.
*   Columns:
    *   `icao24` (PK)
    *   `flight_id` (FK to `user_flights` if applicable)
    *   `timestamp` (ISO8601)
    *   `location` (PostGIS Point)
    *   `altitude_ft`
    *   `speed_kts`
    *   `heading`
    *   `vertical_rate`
    *   `on_ground` (Boolean)
    *   `squawk`

## 3. Frontend Implementation (Deck.gl)

### 3.1 `FlightTrackerMap` Component
*   **Library**: `deck.gl` (via `@deck.gl/react`).
*   **Layers**:
    *   `IconLayer`: For aircraft icons.
        *   **Rotatable**: Icons rotate based on `true_track`.
        *   **Transitions**: Enable `transitions: { getPosition: 1000, getAngle: 1000 }` for smooth 1Hz updates.
    *   `PathLayer`: For historical trail (optional trace).
*   **Data Fetching**:
    *   `useLiveTraffic(bounds)` hook polls `/api/tracking/live?bounds=...` every 2-5s.

## 4. Backend Implementation

### 4.1 API Routes
*   `GET /api/tracking/live`: Proxies request to Airplanes.live (filtering by bounds or aircraft list).
*   `GET /api/aircraft/[icao24]`:
    1.  Checks Supabase `aircraft` table.
    2.  If missing -> Fetches **ADS-B DB**.
    3.  Saves to Supabase -> Returns to client.

## 5. Action Plan
1.  **Migrations**: Enable PostGIS, create tables.
2.  **Lib**: Build `AdsbClient` (Airplanes.live) and `AircraftResolver` (ADS-B DB).
3.  **UI**: Build `FlightTrackerMap` with hardcoded mock data first, then connect to live hook.
