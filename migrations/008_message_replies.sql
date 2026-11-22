-- Replies stay inside the original agent and conversation.
ALTER TABLE citta.messages ADD CONSTRAINT citta_messages_scope_id UNIQUE(agent_id,conversation_id,id);
ALTER TABLE citta.messages ADD COLUMN reply_to_message_id uuid;
ALTER TABLE citta.messages ADD CONSTRAINT citta_message_reply_scope
 FOREIGN KEY(agent_id,conversation_id,reply_to_message_id)
 REFERENCES citta.messages(agent_id,conversation_id,id);
CREATE INDEX citta_message_goal_latest ON citta.messages(agent_id,goal_id,ordinal DESC);
