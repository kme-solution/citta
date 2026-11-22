CREATE INDEX citta_recent_mental_decisions ON citta.decisions(agent_id,created_at DESC)
 WHERE snapshot->>'kind'='mental' AND decision->>'action'<>'INFER';
