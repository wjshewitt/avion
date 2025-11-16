-- Persist full UIMessage payloads for AI SDK v5 compatibility

ALTER TABLE chat_messages
  ADD COLUMN IF NOT EXISTS ui_message JSONB,
  ADD COLUMN IF NOT EXISTS text_content TEXT DEFAULT '';

-- Backfill ui_message with a minimal structure so existing rows render correctly
UPDATE chat_messages
SET ui_message = jsonb_strip_nulls(jsonb_build_object(
      'id', id::text,
      'role', role,
      'parts', CASE
        WHEN content IS NULL OR content = ''
          THEN '[]'::jsonb
        ELSE jsonb_build_array(
          jsonb_build_object(
            'type', 'text',
            'text', content,
            'state', 'done'
          )
        )
      END,
      'metadata', COALESCE(metadata, '{}'::jsonb)
    ))
WHERE ui_message IS NULL;

-- Backfill the denormalized text column for quick previews/search
UPDATE chat_messages
SET text_content = COALESCE(text_content, content)
WHERE TRUE;

COMMENT ON COLUMN chat_messages.ui_message IS 'Full UIMessage payload (role, parts, metadata) stored as JSONB for exact rehydration';
COMMENT ON COLUMN chat_messages.text_content IS 'Denormalized plain-text content of the message for quick previews/search';

CREATE INDEX IF NOT EXISTS idx_chat_messages_ui_message_json ON chat_messages USING GIN (ui_message);
CREATE INDEX IF NOT EXISTS idx_chat_messages_text_content ON chat_messages USING GIN (to_tsvector('simple', COALESCE(text_content, '')));
