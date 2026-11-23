-- Preserve historical reports; only new conversation-follow-up reports use these fields.
ALTER TABLE citta.milestone_reports ADD COLUMN source_goal_id uuid;
ALTER TABLE citta.milestone_reports ADD COLUMN source_goal_version integer;
ALTER TABLE citta.milestone_reports ADD COLUMN report_key text;
ALTER TABLE citta.milestone_reports ADD CONSTRAINT citta_report_source_scope
 FOREIGN KEY(agent_id,source_goal_id) REFERENCES citta.goals(agent_id,id);
CREATE UNIQUE INDEX citta_report_result_once ON citta.milestone_reports(agent_id,report_key)
 WHERE report_key IS NOT NULL;
