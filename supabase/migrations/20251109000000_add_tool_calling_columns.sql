-- Add tool calling tracking to Gemini usage logs
-- Enables monitoring of when AI refreshes weather data via tools

ALTER TABLE gemini_usage_logs
ADD COLUMN IF NOT EXISTS data_refreshed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tool_calls_made INTEGER DEFAULT 0;

-- Add index for tracking tool usage
CREATE INDEX IF NOT EXISTS idx_gemini_usage_data_refreshed 
  ON gemini_usage_logs(data_refreshed) 
  WHERE data_refreshed = TRUE;

-- Comments
COMMENT ON COLUMN gemini_usage_logs.data_refreshed IS 'Whether the AI refreshed weather data during this interaction';
COMMENT ON COLUMN gemini_usage_logs.tool_calls_made IS 'Number of tool calls (function calls) made during this interaction';
