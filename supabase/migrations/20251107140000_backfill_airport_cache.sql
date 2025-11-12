-- Backfill airport_cache from airports table and add necessary indexes
-- Migration: 20251107140000_backfill_airport_cache.sql
-- This migration is idempotent and safe to re-run

-- ============================================================================
-- Add Unique Indexes for airport_cache (if not exist)
-- ============================================================================

-- Unique partial indexes for ICAO and IATA lookups
CREATE UNIQUE INDEX IF NOT EXISTS uq_airport_cache_icao 
  ON airport_cache(icao_code) 
  WHERE icao_code IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_airport_cache_iata 
  ON airport_cache(iata_code) 
  WHERE iata_code IS NOT NULL;

-- Full-text search index for airport names and locations
CREATE INDEX IF NOT EXISTS idx_airport_cache_search 
  ON airport_cache USING GIN (
    to_tsvector('simple', 
      COALESCE((core_data->>'name'), '') || ' ' || 
      COALESCE((core_data->'location'->>'municipality'), '') || ' ' || 
      COALESCE((core_data->'location'->>'region'), '') || ' ' || 
      COALESCE((core_data->'location'->>'country'), '')
    )
  );

-- Geo-location lookups (if core_data has coordinates)
CREATE INDEX IF NOT EXISTS idx_airport_cache_country_continent 
  ON airport_cache(
    (core_data->'location'->>'country'),
    (core_data->'location'->>'continent')
  );

-- Freshness tracking for cache invalidation
CREATE INDEX IF NOT EXISTS idx_airport_cache_last_verified 
  ON airport_cache(last_verified_at DESC);

-- ============================================================================
-- RLS Policies for airport_cache
-- ============================================================================

-- Enable RLS (if not already enabled)
ALTER TABLE airport_cache ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Allow authenticated read access to airport_cache" ON airport_cache;
DROP POLICY IF EXISTS "Service role can manage airport_cache" ON airport_cache;

-- Allow authenticated users to read all cached airports
CREATE POLICY "Allow authenticated read access to airport_cache"
  ON airport_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- Service role can write/update (for API server operations)
CREATE POLICY "Service role can manage airport_cache"
  ON airport_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- Backfill airport_cache from airports table
-- ============================================================================

-- Transform and insert airports data into airport_cache
-- This is an idempotent operation using ON CONFLICT DO NOTHING
INSERT INTO airport_cache (
  icao_code,
  iata_code,
  core_data,
  runway_data,
  communication_data,
  raw_api_response,
  data_completeness,
  processing_version,
  created_at,
  updated_at,
  last_verified_at
)
SELECT 
  a.icao,
  a.iata,
  -- Core data extracted from airports table
  jsonb_build_object(
    'icao', a.icao,
    'iata', a.iata,
    'name', a.name,
    'coordinates', jsonb_build_object(
      'latitude', a.latitude,
      'longitude', a.longitude,
      'elevation_ft', a.elevation_ft
    ),
    'location', jsonb_build_object(
      'municipality', a.city,
      'region', a.state,
      'country', a.country,
      'continent', COALESCE(a.raw->'continent', 'null'::jsonb)
    ),
    'classification', jsonb_build_object(
      'type', COALESCE(a.raw->'type', 'null'::jsonb),
      'scheduled_service', COALESCE(a.raw->'scheduled_service', 'null'::jsonb)
    )
  ) as core_data,
  -- Runway data from existing runways column
  CASE 
    WHEN a.runways IS NOT NULL AND jsonb_array_length(a.runways) > 0 
    THEN jsonb_build_object(
      'count', jsonb_array_length(a.runways),
      'details', a.runways
    )
    ELSE NULL
  END as runway_data,
  -- Communication data from existing frequencies column
  CASE 
    WHEN a.frequencies IS NOT NULL AND jsonb_array_length(a.frequencies) > 0 
    THEN jsonb_build_object(
      'frequencies_by_type', a.frequencies
    )
    ELSE NULL
  END as communication_data,
  -- Raw API response (if available)
  a.raw as raw_api_response,
  -- Data completeness heuristic (0-100)
  (
    CASE WHEN a.icao IS NOT NULL THEN 20 ELSE 0 END +
    CASE WHEN a.name IS NOT NULL THEN 15 ELSE 0 END +
    CASE WHEN a.latitude IS NOT NULL AND a.longitude IS NOT NULL THEN 15 ELSE 0 END +
    CASE WHEN a.runways IS NOT NULL AND jsonb_array_length(a.runways) > 0 THEN 20 ELSE 0 END +
    CASE WHEN a.frequencies IS NOT NULL AND jsonb_array_length(a.frequencies) > 0 THEN 15 ELSE 0 END +
    CASE WHEN a.timezone IS NOT NULL THEN 10 ELSE 0 END +
    CASE WHEN a.raw IS NOT NULL THEN 5 ELSE 0 END
  ) as data_completeness,
  '1.0' as processing_version,
  a.updated_at as created_at,
  a.updated_at,
  a.updated_at as last_verified_at
FROM airports a
WHERE 
  -- Only migrate valid ICAO codes
  a.icao IS NOT NULL 
  AND a.icao ~ '^[A-Z]{4}$'
ON CONFLICT (icao_code) DO NOTHING;

-- ============================================================================
-- Create function to sync airports to airport_cache (optional, for future use)
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_airport_to_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- On INSERT or UPDATE of airports table, sync to airport_cache
  INSERT INTO airport_cache (
    icao_code,
    iata_code,
    core_data,
    runway_data,
    communication_data,
    raw_api_response,
    data_completeness,
    processing_version,
    last_verified_at
  )
  VALUES (
    NEW.icao,
    NEW.iata,
    jsonb_build_object(
      'icao', NEW.icao,
      'iata', NEW.iata,
      'name', NEW.name,
      'coordinates', jsonb_build_object(
        'latitude', NEW.latitude,
        'longitude', NEW.longitude,
        'elevation_ft', NEW.elevation_ft
      ),
      'location', jsonb_build_object(
        'municipality', NEW.city,
        'region', NEW.state,
        'country', NEW.country,
        'continent', COALESCE(NEW.raw->'continent', 'null'::jsonb)
      ),
      'classification', jsonb_build_object(
        'type', COALESCE(NEW.raw->'type', 'null'::jsonb),
        'scheduled_service', COALESCE(NEW.raw->'scheduled_service', 'null'::jsonb)
      )
    ),
    CASE 
      WHEN NEW.runways IS NOT NULL AND jsonb_array_length(NEW.runways) > 0 
      THEN jsonb_build_object('count', jsonb_array_length(NEW.runways), 'details', NEW.runways)
      ELSE NULL
    END,
    CASE 
      WHEN NEW.frequencies IS NOT NULL AND jsonb_array_length(NEW.frequencies) > 0 
      THEN jsonb_build_object('frequencies_by_type', NEW.frequencies)
      ELSE NULL
    END,
    NEW.raw,
    (
      CASE WHEN NEW.icao IS NOT NULL THEN 20 ELSE 0 END +
      CASE WHEN NEW.name IS NOT NULL THEN 15 ELSE 0 END +
      CASE WHEN NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN 15 ELSE 0 END +
      CASE WHEN NEW.runways IS NOT NULL AND jsonb_array_length(NEW.runways) > 0 THEN 20 ELSE 0 END +
      CASE WHEN NEW.frequencies IS NOT NULL AND jsonb_array_length(NEW.frequencies) > 0 THEN 15 ELSE 0 END +
      CASE WHEN NEW.timezone IS NOT NULL THEN 10 ELSE 0 END +
      CASE WHEN NEW.raw IS NOT NULL THEN 5 ELSE 0 END
    ),
    '1.0',
    NEW.updated_at
  )
  ON CONFLICT (icao_code) DO UPDATE SET
    iata_code = EXCLUDED.iata_code,
    core_data = EXCLUDED.core_data,
    runway_data = EXCLUDED.runway_data,
    communication_data = EXCLUDED.communication_data,
    raw_api_response = EXCLUDED.raw_api_response,
    data_completeness = EXCLUDED.data_completeness,
    updated_at = NOW(),
    last_verified_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create trigger to keep airport_cache in sync with airports
-- Uncomment if you want automatic sync (recommended for production)
-- CREATE TRIGGER sync_airports_to_cache
--   AFTER INSERT OR UPDATE ON airports
--   FOR EACH ROW
--   EXECUTE FUNCTION sync_airport_to_cache();

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON INDEX uq_airport_cache_icao IS 'Unique constraint on ICAO codes for fast cache lookups';
COMMENT ON INDEX uq_airport_cache_iata IS 'Unique constraint on IATA codes for fast cache lookups';
COMMENT ON INDEX idx_airport_cache_search IS 'Full-text search index for airport names and locations';
COMMENT ON INDEX idx_airport_cache_country_continent IS 'Geographic filtering by country and continent';
COMMENT ON INDEX idx_airport_cache_last_verified IS 'TTL management and cache invalidation by verification time';

-- ============================================================================
-- Verification Query (run after migration)
-- ============================================================================

-- Uncomment to verify the backfill:
-- SELECT 
--   COUNT(*) as total_cached,
--   COUNT(DISTINCT icao_code) as unique_icao,
--   COUNT(DISTINCT iata_code) as unique_iata,
--   AVG(data_completeness) as avg_completeness,
--   MIN(last_verified_at) as oldest_entry,
--   MAX(last_verified_at) as newest_entry
-- FROM airport_cache;
