BEGIN;
CREATE SCHEMA IF NOT EXISTS runtime;
CREATE TABLE runtime.memories (
  id text PRIMARY KEY, question text NOT NULL, recalls integer NOT NULL DEFAULT 0,
  resolved boolean NOT NULL DEFAULT false
);
CREATE TABLE runtime.goals (
  memory_id text PRIMARY KEY REFERENCES runtime.memories, description text NOT NULL,
  completed_at timestamptz
);
CREATE TABLE runtime.history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  memory_id text NOT NULL REFERENCES runtime.memories, cycle jsonb NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
COMMIT;
