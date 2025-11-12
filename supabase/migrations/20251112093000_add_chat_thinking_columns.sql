-- Add columns for storing AI thinking traces during streaming conversations

ALTER TABLE chat_messages
  ADD COLUMN IF NOT EXISTS thinking_content TEXT,
  ADD COLUMN IF NOT EXISTS thinking_tokens INTEGER DEFAULT 0;

COMMENT ON COLUMN chat_messages.thinking_content IS 'Raw reasoning trace (if thinking output was streamed)';
COMMENT ON COLUMN chat_messages.thinking_tokens IS 'Number of tokens consumed by the reasoning trace';
