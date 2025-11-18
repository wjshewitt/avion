-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Update airports table with geography column
ALTER TABLE public.airports ADD COLUMN IF NOT EXISTS geog geography(POINT, 4326);

-- Create index for spatial queries
CREATE INDEX IF NOT EXISTS idx_airports_geog ON public.airports USING GIST (geog);

-- Update existing rows (assuming latitude and longitude exist)
UPDATE public.airports 
SET geog = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography 
WHERE geog IS NULL AND latitude IS NOT NULL AND longitude IS NOT NULL;

-- Trigger to automatically update geog when lat/lon changes
CREATE OR REPLACE FUNCTION update_geog_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geog := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_airports_geog ON public.airports;
CREATE TRIGGER update_airports_geog
  BEFORE INSERT OR UPDATE OF latitude, longitude ON public.airports
  FOR EACH ROW
  EXECUTE FUNCTION update_geog_column();


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
