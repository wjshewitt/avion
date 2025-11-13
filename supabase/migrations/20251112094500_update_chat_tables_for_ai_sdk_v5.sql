-- Align chat schema with AI SDK v5 message format and usage tracking

-- chat_conversations adjustments -------------------------------------------------
ALTER TABLE chat_conversations
  ALTER COLUMN title SET DEFAULT 'Untitled Conversation';

-- Ensure updated_at is always defined
UPDATE chat_conversations
SET updated_at = NOW()
WHERE updated_at IS NULL;

ALTER TABLE chat_conversations
  ALTER COLUMN updated_at SET DEFAULT NOW();

-- chat_messages enhancements ------------------------------------------------------
ALTER TABLE chat_messages
  ALTER COLUMN content SET DEFAULT '';

ALTER TABLE chat_messages
  ADD COLUMN IF NOT EXISTS weather_tool_data JSONB,
  ADD COLUMN IF NOT EXISTS airport_tool_data JSONB,
  ADD COLUMN IF NOT EXISTS metadata JSONB;

-- tokens_used should always be JSON for the AI SDK payload
ALTER TABLE chat_messages
  ALTER COLUMN tokens_used TYPE JSONB USING tokens_used::jsonb,
  ALTER COLUMN tokens_used SET DEFAULT '{}'::jsonb;

-- Ensure existing rows have proper defaults
UPDATE chat_messages
SET tokens_used = COALESCE(tokens_used, '{}'::jsonb),
    weather_tool_data = COALESCE(weather_tool_data, '[]'::jsonb),
    airport_tool_data = COALESCE(airport_tool_data, '[]'::jsonb),
    metadata = COALESCE(metadata, '{}'::jsonb)
WHERE TRUE;

-- gemini_usage_logs enhancements --------------------------------------------------
ALTER TABLE gemini_usage_logs
  ALTER COLUMN input_tokens SET DEFAULT 0,
  ALTER COLUMN output_tokens SET DEFAULT 0,
  ALTER COLUMN cost_usd SET DEFAULT 0,
  ALTER COLUMN model SET DEFAULT 'gemini-2.5-flash';

ALTER TABLE gemini_usage_logs
  ADD COLUMN IF NOT EXISTS total_tokens INTEGER GENERATED ALWAYS AS (COALESCE(input_tokens,0) + COALESCE(output_tokens,0)) STORED,
  ADD COLUMN IF NOT EXISTS diagnostics JSONB;

-- Index improvements --------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_created
  ON chat_messages (conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_metadata
  ON chat_messages USING GIN (metadata);

CREATE INDEX IF NOT EXISTS idx_gemini_usage_total_tokens
  ON gemini_usage_logs (total_tokens DESC NULLS LAST);

-- Comment updates ----------------------------------------------------------------
COMMENT ON COLUMN chat_messages.weather_tool_data IS 'Array of weather tool invocation payloads (JSON)';
COMMENT ON COLUMN chat_messages.airport_tool_data IS 'Array of airport or flight tool invocation payloads (JSON)';
COMMENT ON COLUMN chat_messages.metadata IS 'UI message metadata (conversation ID, provider details, etc.)';
COMMENT ON COLUMN gemini_usage_logs.diagnostics IS 'Provider response diagnostics (warnings, headers, latency, etc.)';
