-- Add General Chat Support
-- Allows weather assistant chat without requiring a specific flight

-- Add chat_type column to differentiate between flight-specific and general chats
ALTER TABLE chat_conversations 
  ADD COLUMN chat_type VARCHAR(20) DEFAULT 'flight' 
  CHECK (chat_type IN ('flight', 'general'));

-- Make flight_id nullable to support general chats
ALTER TABLE chat_conversations 
  ALTER COLUMN flight_id DROP NOT NULL;

-- Add constraint: flight chats must have flight_id, general chats must not
ALTER TABLE chat_conversations
  ADD CONSTRAINT flight_chat_requires_flight_id
  CHECK (
    (chat_type = 'flight' AND flight_id IS NOT NULL) OR
    (chat_type = 'general' AND flight_id IS NULL)
  );

-- Add index for efficient general chat queries
CREATE INDEX idx_chat_conversations_type 
  ON chat_conversations(user_id, chat_type, updated_at DESC);

-- Update RLS policies to support general chats (no changes needed, they already use user_id)

-- Comments
COMMENT ON COLUMN chat_conversations.chat_type IS 'Type of chat: flight (specific flight context) or general (airport weather queries)';
