-- Add Airport Tool Data Storage to Chat Messages
-- Enables displaying airport popup when AI makes airport capability tool calls

ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS airport_tool_data JSONB DEFAULT NULL;

-- Add index for efficient airport data queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_airport_data 
  ON chat_messages(conversation_id) 
  WHERE airport_tool_data IS NOT NULL;

-- Comments
COMMENT ON COLUMN chat_messages.airport_tool_data IS 'Stores airport data when AI calls get_airport_capabilities tool. Format: {icao, airport, runways, navigation, communications, suitability}';
