-- Airport Cache and Rate Limiting Tables for AirportDB Integration
-- Migration: 20251106170000_create_airport_cache_tables.sql

-- ============================================================================
-- Airport Cache Table with Segmented JSONB Fields
-- ============================================================================

CREATE TABLE airport_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icao_code text NOT NULL UNIQUE,
  iata_code text,

  -- Core airport data (always present)
  core_data jsonb NOT NULL, -- Basic info, coordinates, classification

  -- Segmented operational data
  runway_data jsonb, -- Processed runway info with capabilities
  communication_data jsonb, -- Organized frequencies by type
  navigation_data jsonb, -- Navaids and approach capabilities
  capability_data jsonb, -- Derived operational capabilities

  -- Raw API response (for debugging/reprocessing)
  raw_api_response jsonb,

  -- Metadata
  data_completeness integer DEFAULT 0 CHECK (data_completeness >= 0 AND data_completeness <= 100),
  processing_version text DEFAULT '1.0',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_verified_at timestamptz DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_icao_code CHECK (icao_code ~ '^[A-Z]{4}$'),
  CONSTRAINT valid_iata_code CHECK (iata_code IS NULL OR iata_code ~ '^[A-Z]{3}$')
);

-- Performance indexes
CREATE INDEX idx_airport_cache_icao ON airport_cache(icao_code);
CREATE INDEX idx_airport_cache_iata ON airport_cache(iata_code) WHERE iata_code IS NOT NULL;
CREATE INDEX idx_airport_cache_created_at ON airport_cache(created_at DESC);
CREATE INDEX idx_airport_cache_last_verified ON airport_cache(last_verified_at DESC);

-- JSONB indexes for efficient querying of segmented data
CREATE INDEX idx_airport_runway_gin ON airport_cache USING gin(runway_data);
CREATE INDEX idx_airport_capabilities_gin ON airport_cache USING gin(capability_data);
CREATE INDEX idx_airport_communications_gin ON airport_cache USING gin(communication_data);
CREATE INDEX idx_airport_navigation_gin ON airport_cache USING gin(navigation_data);

-- Core data search index for airport names and locations
CREATE INDEX idx_airport_core_data_gin ON airport_cache USING gin(core_data);

-- ============================================================================
-- API Rate Limiting Table
-- ============================================================================

CREATE TABLE api_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL,
  request_count integer DEFAULT 0 CHECK (request_count >= 0),
  window_start timestamptz DEFAULT now(),
  window_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Ensure window_end is after window_start
  CONSTRAINT valid_time_window CHECK (window_end > window_start),
  
  -- Unique constraint for service and time window
  UNIQUE(service_name, window_start)
);

-- Indexes for rate limiting queries
CREATE INDEX idx_rate_limits_service ON api_rate_limits(service_name);
CREATE INDEX idx_rate_limits_window ON api_rate_limits(service_name, window_start, window_end);
CREATE INDEX idx_rate_limits_active ON api_rate_limits(service_name, window_end);

-- ============================================================================
-- Updated_at Triggers
-- ============================================================================

-- Apply updated_at trigger to airport_cache table
CREATE TRIGGER update_airport_cache_updated_at
  BEFORE UPDATE ON airport_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to api_rate_limits table
CREATE TRIGGER update_api_rate_limits_updated_at
  BEFORE UPDATE ON api_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE airport_cache IS 'Cached airport data from AirportDB.io API with segmented JSONB storage for efficient querying';
COMMENT ON COLUMN airport_cache.core_data IS 'Essential airport information: identifiers, name, coordinates, classification';
COMMENT ON COLUMN airport_cache.runway_data IS 'Runway specifications, capabilities, and aircraft suitability analysis';
COMMENT ON COLUMN airport_cache.communication_data IS 'Radio frequencies organized by operational type (Tower, Ground, Approach, etc.)';
COMMENT ON COLUMN airport_cache.navigation_data IS 'Navigation aids, approach types, and precision approach capabilities';
COMMENT ON COLUMN airport_cache.capability_data IS 'Derived operational capabilities and aircraft category suitability';
COMMENT ON COLUMN airport_cache.raw_api_response IS 'Complete raw response from AirportDB.io API for debugging and reprocessing';
COMMENT ON COLUMN airport_cache.data_completeness IS 'Percentage (0-100) indicating completeness of airport data';

COMMENT ON TABLE api_rate_limits IS 'API usage tracking for rate limiting compliance with external services';
COMMENT ON COLUMN api_rate_limits.service_name IS 'Name of the external API service (e.g., "airportdb")';
COMMENT ON COLUMN api_rate_limits.request_count IS 'Number of requests made within the current time window';
COMMENT ON COLUMN api_rate_limits.window_start IS 'Start time of the current rate limiting window';
COMMENT ON COLUMN api_rate_limits.window_end IS 'End time of the current rate limiting window';