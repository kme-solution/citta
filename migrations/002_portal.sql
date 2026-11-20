BEGIN;
CREATE SCHEMA IF NOT EXISTS runtime;
CREATE TABLE runtime.portal_notes (
  conversation_id uuid NOT NULL,
  message_id uuid PRIMARY KEY,
  body text NOT NULL,
  ordinal bigint GENERATED ALWAYS AS IDENTITY UNIQUE
);
CREATE INDEX portal_notes_latest ON runtime.portal_notes(conversation_id, ordinal DESC);
COMMIT;
