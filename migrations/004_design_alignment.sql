-- Source only. Apply only when Kyaw explicitly authorizes migration execution.
ALTER TABLE citta.motives ADD UNIQUE(agent_id,id);
CREATE TABLE citta.motive_contexts (
 agent_id text NOT NULL, motive_id uuid NOT NULL, conversation_id uuid NOT NULL,
 last_topic text, last_context_signature text, unchanged_turns integer NOT NULL DEFAULT 0 CHECK(unchanged_turns>=0),
 turns integer NOT NULL DEFAULT 0, next_eligible_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(agent_id,motive_id,conversation_id),
 FOREIGN KEY(agent_id,motive_id) REFERENCES citta.motives(agent_id,id),
 FOREIGN KEY(agent_id,conversation_id) REFERENCES citta.conversations(agent_id,id)
);
CREATE INDEX citta_motive_eligibility ON citta.motive_contexts(agent_id,conversation_id,next_eligible_at);
CREATE INDEX citta_attention_heads ON citta.observations(
 agent_id,(CASE WHEN kind='speech' THEN 'speech' WHEN kind='result' THEN 'result' WHEN payload ? 'recallGoalId' THEN 'recall' ELSE 'mental' END),created_at,id
) WHERE state='pending';
ALTER TABLE citta.goals ADD COLUMN resume_state text CHECK(resume_state IN ('active','suspended','waiting'));
ALTER TABLE citta.proposals ADD COLUMN benefit text NOT NULL DEFAULT '';
ALTER TABLE citta.proposals ADD COLUMN scope text NOT NULL DEFAULT 'unspecified';
ALTER TABLE citta.proposals ADD COLUMN version integer NOT NULL DEFAULT 1;
ALTER TABLE citta.proposals ADD UNIQUE(agent_id,id);
CREATE TABLE citta.proposal_reviews (
 id uuid PRIMARY KEY, agent_id text NOT NULL REFERENCES citta.agents(id),
 proposal_id uuid NOT NULL, request jsonb NOT NULL, result jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(agent_id,proposal_id) REFERENCES citta.proposals(agent_id,id)
);
ALTER TABLE citta.agents ADD COLUMN decision_sequence bigint NOT NULL DEFAULT 0 CHECK(decision_sequence>=0);
ALTER TABLE citta.decisions ADD COLUMN sequence bigint;
CREATE UNIQUE INDEX citta_decision_sequence ON citta.decisions(agent_id,sequence);
CREATE TABLE citta.goal_versions (
 agent_id text NOT NULL, goal_id uuid NOT NULL, version integer NOT NULL,
 snapshot jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(agent_id,goal_id,version),
 FOREIGN KEY(agent_id,goal_id) REFERENCES citta.goals(agent_id,id)
);
CREATE TABLE citta.goal_transitions (
 ordinal bigserial PRIMARY KEY, agent_id text NOT NULL, goal_id uuid NOT NULL,
 version integer NOT NULL, previous_state text, state text NOT NULL,
 reason text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(agent_id,goal_id) REFERENCES citta.goals(agent_id,id)
);
-- Existing rows are migration-time snapshots, explicitly distinguished from an original creation trace.
INSERT INTO citta.goal_versions(agent_id,goal_id,version,snapshot)
 SELECT agent_id,id,version,jsonb_build_object('origin','migration snapshot; original version chronology unavailable','goal',to_jsonb(g)) FROM citta.goals g;
CREATE FUNCTION citta.guard_goal_version() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.version<OLD.version THEN RAISE EXCEPTION 'Goal version cannot decrease'; END IF;
 IF OLD.state IN ('completed','cancelled') AND NEW.state<>OLD.state THEN RAISE EXCEPTION 'Terminal goal cannot resume'; END IF;
 IF NEW.description IS DISTINCT FROM OLD.description OR NEW.criterion IS DISTINCT FROM OLD.criterion THEN
  IF OLD.state IN ('completed','cancelled') THEN RAISE EXCEPTION 'Terminal goal criteria are immutable'; END IF;
  IF NEW.version=OLD.version THEN NEW.version=OLD.version+1; END IF;
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER citta_goal_version_guard BEFORE UPDATE ON citta.goals FOR EACH ROW EXECUTE FUNCTION citta.guard_goal_version();
CREATE FUNCTION citta.record_goal_history() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='INSERT' THEN
  INSERT INTO citta.goal_versions(agent_id,goal_id,version,snapshot) VALUES(NEW.agent_id,NEW.id,NEW.version,jsonb_build_object('origin','goal creation','goal',to_jsonb(NEW)));
  INSERT INTO citta.goal_transitions(agent_id,goal_id,version,state,reason) VALUES(NEW.agent_id,NEW.id,NEW.version,NEW.state,'goal creation');
 ELSE
  IF NEW.version<>OLD.version THEN
   INSERT INTO citta.goal_versions(agent_id,goal_id,version,snapshot) VALUES(NEW.agent_id,NEW.id,NEW.version,jsonb_build_object('origin','goal revision','previousVersion',OLD.version,'goal',to_jsonb(NEW)));
  END IF;
  IF NEW.state IS DISTINCT FROM OLD.state THEN
   INSERT INTO citta.goal_transitions(agent_id,goal_id,version,previous_state,state,reason) VALUES(NEW.agent_id,NEW.id,NEW.version,OLD.state,NEW.state,COALESCE(NEW.wait_reason,NULLIF(NEW.summary,''),'domain transition'));
  END IF;
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER citta_goal_history AFTER INSERT OR UPDATE ON citta.goals FOR EACH ROW EXECUTE FUNCTION citta.record_goal_history();
ALTER TABLE citta.observations ADD COLUMN not_before timestamptz NOT NULL DEFAULT now();
ALTER TABLE citta.frames ADD COLUMN parent_goal_id uuid;
ALTER TABLE citta.frames ADD COLUMN continuation_depth integer NOT NULL DEFAULT 1 CHECK(continuation_depth BETWEEN 1 AND 4);
ALTER TABLE citta.frames ADD FOREIGN KEY(agent_id,parent_goal_id) REFERENCES citta.goals(agent_id,id);
CREATE TABLE citta.preferences (
 agent_id text NOT NULL REFERENCES citta.agents(id), conversation_id uuid NOT NULL,
 key text NOT NULL CHECK(key IN ('response-language','response-length','explanation-style')),
 value text NOT NULL, version integer NOT NULL DEFAULT 1,
 memory_id uuid NOT NULL, source_id uuid NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(agent_id,conversation_id,key),
 FOREIGN KEY(agent_id,conversation_id) REFERENCES citta.conversations(agent_id,id),
 FOREIGN KEY(agent_id,memory_id) REFERENCES citta.memories(agent_id,id),
 FOREIGN KEY(agent_id,source_id) REFERENCES citta.observations(agent_id,id)
);
ALTER TABLE citta.motives ADD COLUMN conversation_id uuid;
ALTER TABLE citta.motives ADD COLUMN source_observation_id uuid;
ALTER TABLE citta.motives ADD COLUMN evidence_ids jsonb NOT NULL DEFAULT '[]';
ALTER TABLE citta.motives ADD FOREIGN KEY(agent_id,conversation_id) REFERENCES citta.conversations(agent_id,id);
ALTER TABLE citta.motives ADD FOREIGN KEY(agent_id,source_observation_id) REFERENCES citta.observations(agent_id,id);
UPDATE citta.motives SET enabled=false WHERE origin='inferred-from-observation' AND source_observation_id IS NULL;
