-- Citta-owned working-context references; durable domain memory remains in its existing tables.
CREATE TABLE citta.cognition_threads (
 agent_id text NOT NULL REFERENCES citta.agents(id),
 conversation_id uuid NOT NULL,
 profile_id text NOT NULL,
 context_key text NOT NULL,
 thread_id text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(agent_id,conversation_id,profile_id,context_key),
 FOREIGN KEY(agent_id,conversation_id) REFERENCES citta.conversations(agent_id,id),
 FOREIGN KEY(agent_id,profile_id) REFERENCES citta.profiles(agent_id,id)
);
