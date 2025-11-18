-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Update airport_cache table with geography column
-- Note: 'airports' is now a view pointing to 'airport_cache'
-- We must add the physical column to the underlying table
ALTER TABLE public.airport_cache ADD COLUMN IF NOT EXISTS geog geography(POINT, 4326);

-- Create index for spatial queries on the cache
CREATE INDEX IF NOT EXISTS idx_airport_cache_geog ON public.airport_cache USING GIST (geog);

-- Update existing rows by extracting lat/lon from the generated columns or core_data
UPDATE public.airport_cache 
SET geog = ST_SetSRID(ST_MakePoint(
  COALESCE(longitude, (core_data->'location'->>'longitude')::double precision), 
  COALESCE(latitude, (core_data->'location'->>'latitude')::double precision)
), 4326)::geography 
WHERE geog IS NULL 
  AND (longitude IS NOT NULL OR core_data->'location'->>'longitude' IS NOT NULL)
  AND (latitude IS NOT NULL OR core_data->'location'->>'latitude' IS NOT NULL);

-- Trigger to automatically update geog when core_data changes
CREATE OR REPLACE FUNCTION update_airport_cache_geog()
RETURNS TRIGGER AS $$
DECLARE
  lat double precision;
  lon double precision;
BEGIN
  -- Extract coordinates from the new core_data
  lat := (NEW.core_data->'location'->>'latitude')::double precision;
  lon := (NEW.core_data->'location'->>'longitude')::double precision;
  
  IF lat IS NOT NULL AND lon IS NOT NULL THEN
    NEW.geog := ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_airport_cache_geog_trigger ON public.airport_cache;
CREATE TRIGGER update_airport_cache_geog_trigger
  BEFORE INSERT OR UPDATE OF core_data ON public.airport_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_airport_cache_geog();

-- Update the airports view to include the geog column
-- We need to redefine the view to expose the new column
DROP VIEW IF EXISTS public.airports;
CREATE OR REPLACE VIEW public.airports AS
SELECT
  ac.icao_code AS icao,
  ac.iata_code AS iata,
  ac.name,
  ac.city,
  ac.state,
  ac.country,
  ac.latitude,
  ac.longitude,
  ac.timezone,
  ac.elevation_ft,
  ac.runways,
  ac.frequencies,
  ac.raw,
  ac.fbo_overview,
  ac.intel_updated_at,
  ac.updated_at,
  ac.geog  -- Expose geography column
FROM public.airport_cache ac;

GRANT SELECT ON public.airports TO anon, authenticated;



-- 2. Create aircraft table (Metadata)
CREATE TABLE IF NOT EXISTS public.aircraft (
    icao24 text PRIMARY KEY,
    registration text,
    type_code text,
    manufacturer text,
    model text,
    owner text,
    image_url text,
    source text DEFAULT 'adsbdb',
    updated_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- RLS for aircraft
ALTER TABLE public.aircraft ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to aircraft"
ON public.aircraft FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Allow service role to manage aircraft"
ON public.aircraft FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_aircraft_updated_at ON public.aircraft;
CREATE TRIGGER update_aircraft_updated_at
  BEFORE UPDATE ON public.aircraft
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- 3. Create live_tracking table (Ephemeral state)
CREATE TABLE IF NOT EXISTS public.live_tracking (
    icao24 text PRIMARY KEY,
    flight_id uuid REFERENCES public.user_flights(id) ON DELETE SET NULL,
    timestamp timestamptz NOT NULL,
    location geography(POINT, 4326),
    altitude_ft integer,
    speed_kts integer,
    heading integer,
    vertical_rate integer,
    on_ground boolean DEFAULT false,
    squawk text,
    source text DEFAULT 'airplanes.live',
    updated_at timestamptz DEFAULT now()
);

-- Index for spatial queries on live tracking
CREATE INDEX IF NOT EXISTS idx_live_tracking_location ON public.live_tracking USING GIST (location);

-- RLS for live_tracking
ALTER TABLE public.live_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to live_tracking"
ON public.live_tracking FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Allow service role to manage live_tracking"
ON public.live_tracking FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
