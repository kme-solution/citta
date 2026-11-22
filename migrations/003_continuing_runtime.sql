-- Additive runtime; existing runtime.* prototype records remain untouched.
CREATE SCHEMA IF NOT EXISTS citta;
CREATE TABLE citta.profiles (
 id text PRIMARY KEY, agent_id text NOT NULL, body jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(agent_id,id)
);
CREATE TABLE citta.agents (
 id text PRIMARY KEY, profile_id text NOT NULL REFERENCES citta.profiles(id), generation bigint NOT NULL DEFAULT 1,
 control text NOT NULL DEFAULT 'running' CHECK(control IN ('running','paused','stopped')),
 control_version integer NOT NULL DEFAULT 0, domain_version bigint NOT NULL DEFAULT 0,
 quiet boolean NOT NULL DEFAULT false, next_internal_at timestamptz NOT NULL DEFAULT now(),
 last_contact_at timestamptz, internal_count integer NOT NULL DEFAULT 0,
 budget_hour timestamptz NOT NULL DEFAULT date_trunc('hour',now()), work_used integer NOT NULL DEFAULT 0,
 heartbeat_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE citta.conversations (
 id uuid PRIMARY KEY, agent_id text NOT NULL REFERENCES citta.agents(id), title text NOT NULL DEFAULT 'Conversation',
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(agent_id,id)
);
CREATE TABLE citta.observations (
 id uuid PRIMARY KEY, agent_id text NOT NULL REFERENCES citta.agents(id), conversation_id uuid REFERENCES citta.conversations(id),
 source_key text NOT NULL, kind text NOT NULL CHECK(kind IN ('speech','mental','result')),
 text text NOT NULL, payload jsonb NOT NULL DEFAULT '{}',
 state text NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','consumed','cancelled')),
 created_at timestamptz NOT NULL DEFAULT now(), consumed_at timestamptz,
 UNIQUE(agent_id,source_key)
);
CREATE INDEX citta_ready ON citta.observations(agent_id,state,created_at);
CREATE TABLE citta.goals (
 id uuid PRIMARY KEY, agent_id text NOT NULL REFERENCES citta.agents(id), conversation_id uuid NOT NULL REFERENCES citta.conversations(id),
 observation_id uuid NOT NULL REFERENCES citta.observations(id), description text NOT NULL, criterion text NOT NULL,
 state text NOT NULL CHECK(state IN ('active','suspended','waiting','paused','completed','exhausted','cancelled')),
 version integer NOT NULL DEFAULT 1, cycles integer NOT NULL DEFAULT 0, adviser_calls integer NOT NULL DEFAULT 0,
 evidence_ids jsonb NOT NULL DEFAULT '[]', summary text NOT NULL DEFAULT '',
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX citta_goal_ready ON citta.goals(agent_id,state,created_at);
CREATE TABLE citta.frames (
 goal_id uuid PRIMARY KEY REFERENCES citta.goals(id), agent_id text NOT NULL REFERENCES citta.agents(id),
 state text NOT NULL CHECK(state IN ('foreground','suspended','waiting','paused','closed')),
 version integer NOT NULL DEFAULT 1, checkpoint jsonb NOT NULL DEFAULT '{}', updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX citta_one_foreground ON citta.frames(agent_id) WHERE state='foreground';
CREATE TABLE citta.actions (
 id uuid PRIMARY KEY, agent_id text NOT NULL REFERENCES citta.agents(id), goal_id uuid NOT NULL REFERENCES citta.goals(id),
 goal_version integer NOT NULL, kind text NOT NULL CHECK(kind IN ('INFER','CONSULT_AI','READ')),
 argument text NOT NULL, context jsonb NOT NULL, generation bigint NOT NULL, control_version integer NOT NULL,
 state text NOT NULL DEFAULT 'queued' CHECK(state IN ('queued','running','succeeded','failed','unknown','cancelled','denied')),
 claim_token uuid, heartbeat_at timestamptz, result jsonb, reviewed boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(), started_at timestamptz, finished_at timestamptz
);
CREATE INDEX citta_actions_pending ON citta.actions(agent_id,state,created_at);
CREATE UNIQUE INDEX citta_one_running_kind ON citta.actions(agent_id,kind) WHERE state='running';
CREATE TABLE citta.memories (
 id uuid PRIMARY KEY, agent_id text NOT NULL REFERENCES citta.agents(id), conversation_id uuid REFERENCES citta.conversations(id),
 kind text NOT NULL CHECK(kind IN ('configured','reported','observed','inferred','commitment')),
 content text NOT NULL, source_id uuid REFERENCES citta.observations(id), supersedes uuid REFERENCES citta.memories(id),
 valid boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX citta_memory_scope ON citta.memories(agent_id,conversation_id,created_at DESC) WHERE valid;
CREATE TABLE citta.messages (
 id uuid PRIMARY KEY, agent_id text NOT NULL REFERENCES citta.agents(id), conversation_id uuid NOT NULL REFERENCES citta.conversations(id),
 role text NOT NULL CHECK(role IN ('operator','citta','adviser','system')), text text NOT NULL,
 observation_id uuid REFERENCES citta.observations(id), goal_id uuid REFERENCES citta.goals(id),
 source text NOT NULL, initiative boolean NOT NULL DEFAULT false,
 contact_state text CHECK(contact_state IN ('created','delivered','seen','answered','deferred','expired')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX citta_messages_scope ON citta.messages(agent_id,conversation_id,created_at);
CREATE TABLE citta.decisions (
 id uuid PRIMARY KEY, agent_id text NOT NULL REFERENCES citta.agents(id), observation_id uuid REFERENCES citta.observations(id),
 goal_id uuid REFERENCES citta.goals(id), operation_key text NOT NULL, engine text NOT NULL, policy text NOT NULL,
 snapshot jsonb NOT NULL, decision jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(agent_id,operation_key)
);
CREATE TABLE citta.appraisals (
 id uuid PRIMARY KEY, agent_id text NOT NULL REFERENCES citta.agents(id), decision_id uuid NOT NULL REFERENCES citta.decisions(id),
 tone text NOT NULL, cause text NOT NULL, uncertainty text NOT NULL, tendency text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE citta.motives (
 id uuid PRIMARY KEY, agent_id text NOT NULL REFERENCES citta.agents(id), name text NOT NULL, origin text NOT NULL,
 description text NOT NULL, last_topic text, turns integer NOT NULL DEFAULT 0,
 version integer NOT NULL DEFAULT 1, enabled boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(agent_id,name)
);
CREATE TABLE citta.proposals (
 id uuid PRIMARY KEY, agent_id text NOT NULL REFERENCES citta.agents(id), goal_id uuid REFERENCES citta.goals(id),
 description text NOT NULL, evidence_ids jsonb NOT NULL, criteria text NOT NULL, risks text NOT NULL,
 state text NOT NULL DEFAULT 'proposed' CHECK(state IN ('proposed','accepted','declined')), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE citta.events (
 ordinal bigserial PRIMARY KEY, agent_id text NOT NULL REFERENCES citta.agents(id),
 kind text NOT NULL, body jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX citta_events_scope ON citta.events(agent_id,ordinal);
CREATE TABLE citta.outbox (
 id uuid PRIMARY KEY, agent_id text NOT NULL REFERENCES citta.agents(id),
 delivered_at timestamptz, claim_token uuid, lease_until timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX citta_outbox_pending ON citta.outbox(created_at) WHERE delivered_at IS NULL;
CREATE TABLE citta.controls (
 id uuid PRIMARY KEY, agent_id text NOT NULL REFERENCES citta.agents(id), request jsonb NOT NULL,
 result jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE citta.operations (
 id text PRIMARY KEY, agent_id text NOT NULL REFERENCES citta.agents(id), result jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE citta.agents ADD COLUMN consecutive_user_turns integer NOT NULL DEFAULT 0;
ALTER TABLE citta.actions ADD COLUMN attempts integer NOT NULL DEFAULT 0;
ALTER TABLE citta.actions ADD COLUMN yields integer NOT NULL DEFAULT 0;
CREATE TABLE citta.attempts (
 action_id uuid NOT NULL REFERENCES citta.actions(id), number integer NOT NULL,
 claim_token uuid NOT NULL, state text NOT NULL, started_at timestamptz NOT NULL DEFAULT now(),
 finished_at timestamptz, usage jsonb, PRIMARY KEY(action_id,number)
);
CREATE TABLE citta.recoveries (
 id uuid PRIMARY KEY, agent_id text NOT NULL REFERENCES citta.agents(id),
 generation bigint NOT NULL, previous_run_id text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX citta_recover_closed_once ON citta.recoveries(agent_id,previous_run_id);
ALTER TABLE citta.goals ADD COLUMN due_at timestamptz;
ALTER TABLE citta.goals ADD COLUMN wait_reason text;
CREATE INDEX citta_due_goals ON citta.goals(agent_id,due_at) WHERE state='waiting' AND due_at IS NOT NULL;
CREATE TABLE citta.contacts (
 id uuid PRIMARY KEY, agent_id text NOT NULL REFERENCES citta.agents(id), conversation_id uuid NOT NULL REFERENCES citta.conversations(id),
 goal_id uuid NOT NULL REFERENCES citta.goals(id), observation_id uuid NOT NULL REFERENCES citta.observations(id),
 topic_key text NOT NULL, text text NOT NULL, reason text NOT NULL,
 state text NOT NULL CHECK(state IN ('created','deferred','delivered','seen','answered','declined','expired')),
 expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(agent_id,topic_key)
);
ALTER TABLE citta.messages ADD COLUMN contact_id uuid REFERENCES citta.contacts(id);
ALTER TABLE citta.goals ADD COLUMN work_ms bigint NOT NULL DEFAULT 0;
ALTER TABLE citta.goals ADD COLUMN budget_cycles integer NOT NULL DEFAULT 12;
ALTER TABLE citta.goals ADD COLUMN budget_adviser integer NOT NULL DEFAULT 2;
ALTER TABLE citta.goals ADD COLUMN budget_ms bigint NOT NULL DEFAULT 300000;
-- Scope is a database invariant as well as an application check.
ALTER TABLE citta.observations ADD UNIQUE(agent_id,id);
ALTER TABLE citta.goals ADD UNIQUE(agent_id,id);
ALTER TABLE citta.memories ADD UNIQUE(agent_id,id);
ALTER TABLE citta.decisions ADD UNIQUE(agent_id,id);
ALTER TABLE citta.contacts ADD UNIQUE(agent_id,id);
ALTER TABLE citta.agents ADD FOREIGN KEY(id,profile_id) REFERENCES citta.profiles(agent_id,id);
ALTER TABLE citta.observations ADD FOREIGN KEY(agent_id,conversation_id) REFERENCES citta.conversations(agent_id,id);
ALTER TABLE citta.goals ADD FOREIGN KEY(agent_id,observation_id) REFERENCES citta.observations(agent_id,id);
ALTER TABLE citta.goals ADD FOREIGN KEY(agent_id,conversation_id) REFERENCES citta.conversations(agent_id,id);
ALTER TABLE citta.frames ADD FOREIGN KEY(agent_id,goal_id) REFERENCES citta.goals(agent_id,id);
ALTER TABLE citta.actions ADD FOREIGN KEY(agent_id,goal_id) REFERENCES citta.goals(agent_id,id);
ALTER TABLE citta.memories ADD FOREIGN KEY(agent_id,conversation_id) REFERENCES citta.conversations(agent_id,id);
ALTER TABLE citta.memories ADD FOREIGN KEY(agent_id,source_id) REFERENCES citta.observations(agent_id,id);
ALTER TABLE citta.memories ADD FOREIGN KEY(agent_id,supersedes) REFERENCES citta.memories(agent_id,id);
ALTER TABLE citta.messages ADD FOREIGN KEY(agent_id,conversation_id) REFERENCES citta.conversations(agent_id,id);
ALTER TABLE citta.messages ADD FOREIGN KEY(agent_id,observation_id) REFERENCES citta.observations(agent_id,id);
ALTER TABLE citta.messages ADD FOREIGN KEY(agent_id,goal_id) REFERENCES citta.goals(agent_id,id);
ALTER TABLE citta.messages ADD FOREIGN KEY(agent_id,contact_id) REFERENCES citta.contacts(agent_id,id);
ALTER TABLE citta.decisions ADD FOREIGN KEY(agent_id,observation_id) REFERENCES citta.observations(agent_id,id);
ALTER TABLE citta.decisions ADD FOREIGN KEY(agent_id,goal_id) REFERENCES citta.goals(agent_id,id);
ALTER TABLE citta.appraisals ADD FOREIGN KEY(agent_id,decision_id) REFERENCES citta.decisions(agent_id,id);
ALTER TABLE citta.contacts ADD FOREIGN KEY(agent_id,conversation_id) REFERENCES citta.conversations(agent_id,id);
ALTER TABLE citta.contacts ADD FOREIGN KEY(agent_id,goal_id) REFERENCES citta.goals(agent_id,id);
ALTER TABLE citta.contacts ADD FOREIGN KEY(agent_id,observation_id) REFERENCES citta.observations(agent_id,id);
ALTER TABLE citta.appraisals ADD COLUMN candidate text NOT NULL DEFAULT 'undetermined';
ALTER TABLE citta.appraisals ADD COLUMN regulation text NOT NULL DEFAULT '';
ALTER TABLE citta.messages ADD COLUMN ordinal bigint GENERATED ALWAYS AS IDENTITY;
CREATE UNIQUE INDEX citta_messages_ordinal ON citta.messages(ordinal);
CREATE INDEX citta_messages_cursor ON citta.messages(agent_id,conversation_id,ordinal DESC);
ALTER TABLE citta.contacts ADD COLUMN topic_label text NOT NULL DEFAULT '';
ALTER TABLE citta.contacts ADD COLUMN content_key text NOT NULL DEFAULT '';
CREATE UNIQUE INDEX citta_contact_content_once ON citta.contacts(agent_id,content_key);
