-- Add Weather Tool Data Storage to Chat Messages
-- Enables displaying weather popup when AI makes weather tool calls

ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS weather_tool_data JSONB DEFAULT NULL;

-- Add index for efficient weather data queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_weather_data 
  ON chat_messages(conversation_id) 
  WHERE weather_tool_data IS NOT NULL;

-- Comments
COMMENT ON COLUMN chat_messages.weather_tool_data IS 'Stores weather data when AI calls get_airport_weather tool. Format: {icao, metar: DecodedMetar, taf: DecodedTaf, timestamp}';
