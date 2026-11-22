CREATE TABLE citta.milestone_reports (
 id uuid PRIMARY KEY,
 agent_id text NOT NULL REFERENCES citta.agents(id),
 conversation_id uuid NOT NULL REFERENCES citta.conversations(id),
 goal_id uuid NOT NULL REFERENCES citta.goals(id),
 goal_version integer NOT NULL,
 milestone text NOT NULL CHECK (milestone IN ('completed','exhausted','waiting')),
 text text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 delivered_at timestamptz,
 superseded_at timestamptz,
 UNIQUE (agent_id,goal_id,goal_version,milestone)
);
CREATE INDEX citta_milestone_pending ON citta.milestone_reports(agent_id,created_at)
 WHERE delivered_at IS NULL AND superseded_at IS NULL;
