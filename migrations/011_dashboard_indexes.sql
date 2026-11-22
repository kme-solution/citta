CREATE INDEX citta_dashboard_messages ON citta.messages(agent_id,ordinal DESC)
 WHERE role='citta' AND (initiative OR source='milestone');
CREATE INDEX citta_dashboard_questions ON citta.goals(agent_id,created_at DESC)
 WHERE state='waiting' AND wait_reason IN ('operator_input','evidence_or_operator_input');
