CREATE TABLE citta.focuses (
 id uuid PRIMARY KEY,
 agent_id text NOT NULL REFERENCES citta.agents(id),
 conversation_id uuid NOT NULL REFERENCES citta.conversations(id),
 motive_id uuid NOT NULL REFERENCES citta.motives(id),
 source_memory_id uuid REFERENCES citta.memories(id),
 source_goal_id uuid REFERENCES citta.goals(id),
 source_goal_version integer,
 source_observation_id uuid REFERENCES citta.observations(id),
 context_signature text NOT NULL,
 topic text NOT NULL,
 state text NOT NULL DEFAULT 'active' CHECK(state IN ('active','settled','blocked','deferred')),
 version integer NOT NULL DEFAULT 1,
 turns integer NOT NULL DEFAULT 0,
 last_outcome text NOT NULL DEFAULT '',
 next_step text NOT NULL DEFAULT '',
 reason text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX citta_one_active_focus ON citta.focuses(agent_id) WHERE state='active';
CREATE INDEX citta_focus_source ON citta.focuses(agent_id,source_goal_id,source_goal_version,context_signature);
CREATE INDEX citta_focus_history ON citta.focuses(agent_id,updated_at DESC);
CREATE INDEX citta_goal_operator_focus ON citta.goals(agent_id,created_at DESC)
 WHERE state IN ('active','waiting','suspended');
CREATE INDEX citta_focus_memory ON citta.focuses(agent_id,source_memory_id,context_signature);
