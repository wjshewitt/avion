-- Airports authoritative table for AirportDB integration

CREATE TABLE IF NOT EXISTS airports (
  icao text PRIMARY KEY,
  iata text,
  name text NOT NULL,
  city text,
  state text,
  country text,
  latitude double precision,
  longitude double precision,
  timezone text,
  elevation_ft integer,
  runways jsonb,
  frequencies jsonb,
  raw jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_airports_country ON airports(country);
CREATE INDEX IF NOT EXISTS idx_airports_city ON airports(city);
CREATE INDEX IF NOT EXISTS idx_airports_name ON airports(name);
CREATE INDEX IF NOT EXISTS idx_airports_updated_at ON airports(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE airports ENABLE ROW LEVEL SECURITY;

-- RLS policies: allow authenticated reads; writes via service role only
DROP POLICY IF EXISTS auth_read_airports ON airports;
CREATE POLICY auth_read_airports ON airports
  FOR SELECT
  TO authenticated
  USING (true);

-- updated_at trigger (assumes update_updated_at_column() exists)
DROP TRIGGER IF EXISTS update_airports_updated_at ON airports;
CREATE TRIGGER update_airports_updated_at
  BEFORE UPDATE ON airports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE airports IS 'Authoritative airports normalized from AirportDB.io';
