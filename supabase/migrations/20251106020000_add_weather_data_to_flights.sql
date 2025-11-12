-- Add weather data columns to user_flights table
-- This migration adds weather intelligence capabilities to flight tracking

ALTER TABLE user_flights 
ADD COLUMN origin_icao VARCHAR(4),
ADD COLUMN destination_icao VARCHAR(4),
ADD COLUMN weather_data JSONB DEFAULT '{}',
ADD COLUMN weather_risk_score INTEGER DEFAULT 0 CHECK (weather_risk_score >= 0 AND weather_risk_score <= 100),
ADD COLUMN weather_focus VARCHAR(20) DEFAULT 'forecast' CHECK (weather_focus IN ('forecast', 'current', 'live', 'archived')),
ADD COLUMN weather_updated_at TIMESTAMPTZ,
ADD COLUMN weather_cache_expires TIMESTAMPTZ,
ADD COLUMN weather_alert_level VARCHAR(10) DEFAULT 'green' CHECK (weather_alert_level IN ('green', 'yellow', 'red'));

-- Create indexes for weather-related queries
CREATE INDEX idx_user_flights_weather_risk ON user_flights(weather_risk_score);
CREATE INDEX idx_user_flights_weather_alert ON user_flights(weather_alert_level);
CREATE INDEX idx_user_flights_weather_focus ON user_flights(weather_focus);
CREATE INDEX idx_user_flights_weather_updated ON user_flights(weather_updated_at);
CREATE INDEX idx_user_flights_weather_expires ON user_flights(weather_cache_expires);

-- Create weather cache table for efficient weather data management
CREATE TABLE weather_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icao_code VARCHAR(4) NOT NULL,
  data_type VARCHAR(10) NOT NULL CHECK (data_type IN ('metar', 'taf')),
  weather_data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(icao_code, data_type)
);

-- Indexes for weather cache
CREATE INDEX idx_weather_cache_expires ON weather_cache(expires_at);
CREATE INDEX idx_weather_cache_icao ON weather_cache(icao_code);
CREATE INDEX idx_weather_cache_type ON weather_cache(data_type);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_weather_cache_updated_at 
    BEFORE UPDATE ON weather_cache 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for weather cache
ALTER TABLE weather_cache ENABLE ROW LEVEL SECURITY;

-- Weather cache is read-only for authenticated users (system manages the data)
CREATE POLICY "Users can view weather cache" ON weather_cache
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only service role can modify weather cache
CREATE POLICY "Service role can manage weather cache" ON weather_cache
    FOR ALL USING (auth.role() = 'service_role');

-- Add comments for documentation
COMMENT ON COLUMN user_flights.origin_icao IS 'ICAO code for origin airport (4-letter code)';
COMMENT ON COLUMN user_flights.destination_icao IS 'ICAO code for destination airport (4-letter code)';
COMMENT ON COLUMN user_flights.weather_data IS 'JSON object containing METAR/TAF data for origin and destination';
COMMENT ON COLUMN user_flights.weather_risk_score IS 'Calculated weather risk score (0-100, higher is more severe)';
COMMENT ON COLUMN user_flights.weather_focus IS 'Weather focus period: forecast, current, live, or archived';
COMMENT ON COLUMN user_flights.weather_updated_at IS 'Timestamp when weather data was last updated';
COMMENT ON COLUMN user_flights.weather_cache_expires IS 'Timestamp when cached weather data expires';
COMMENT ON COLUMN user_flights.weather_alert_level IS 'Weather alert level: green (OK), yellow (caution), red (alert)';

COMMENT ON TABLE weather_cache IS 'Cache table for weather data to reduce API calls and improve performance';
COMMENT ON COLUMN weather_cache.icao_code IS 'ICAO airport code';
COMMENT ON COLUMN weather_cache.data_type IS 'Type of weather data: metar or taf';
COMMENT ON COLUMN weather_cache.weather_data IS 'Raw weather data from API';
COMMENT ON COLUMN weather_cache.expires_at IS 'When this cache entry expires and should be refreshed';