-- Add indexes for airport filtering performance
-- Migration: 20251116000000_add_airport_filter_indexes.sql

-- Index for country filtering
CREATE INDEX IF NOT EXISTS idx_airport_country 
  ON airport_cache ((core_data->'location'->>'country'))
  WHERE core_data->'location'->>'country' IS NOT NULL;

-- Index for type filtering
CREATE INDEX IF NOT EXISTS idx_airport_type 
  ON airport_cache ((core_data->'classification'->>'type'))
  WHERE core_data->'classification'->>'type' IS NOT NULL;

-- Index for runway length filtering
CREATE INDEX IF NOT EXISTS idx_runway_length 
  ON airport_cache (CAST(runway_data->>'longest_ft' AS INTEGER))
  WHERE runway_data->>'longest_ft' IS NOT NULL;

-- Index for ILS capability
CREATE INDEX IF NOT EXISTS idx_ils_equipped 
  ON airport_cache (CAST(runway_data->>'ils_equipped' AS BOOLEAN))
  WHERE runway_data->>'ils_equipped' IS NOT NULL;

-- Index for lighting requirement
CREATE INDEX IF NOT EXISTS idx_runway_all_lighted
  ON airport_cache (CAST(runway_data->>'all_lighted' AS BOOLEAN))
  WHERE runway_data->>'all_lighted' IS NOT NULL;

-- Index for scheduled service
CREATE INDEX IF NOT EXISTS idx_scheduled_service 
  ON airport_cache (CAST(core_data->'classification'->>'scheduled_service' AS BOOLEAN))
  WHERE core_data->'classification'->>'scheduled_service' IS NOT NULL;

-- Composite index for common query patterns (country + type)
CREATE INDEX IF NOT EXISTS idx_airport_country_type 
  ON airport_cache (
    (core_data->'location'->>'country'),
    (core_data->'classification'->>'type')
  )
  WHERE core_data IS NOT NULL;

-- Comment for documentation
COMMENT ON INDEX idx_airport_country IS 'Speeds up country-based airport filtering';
COMMENT ON INDEX idx_airport_type IS 'Speeds up airport type filtering';
COMMENT ON INDEX idx_runway_length IS 'Speeds up minimum runway length filtering';
COMMENT ON INDEX idx_ils_equipped IS 'Speeds up ILS capability filtering';
COMMENT ON INDEX idx_runway_all_lighted IS 'Speeds up runway lighting requirement filtering';
COMMENT ON INDEX idx_airport_country_type IS 'Composite index for country+type queries';
