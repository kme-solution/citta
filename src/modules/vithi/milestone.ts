import { randomUUID } from 'node:crypto';
import { config } from '../../app/config.ts';
import { event, type Tx } from '../../infra/postgres/database.ts';

/** Reports describe persisted work, not an extra model's interpretation of success. */
export async function retainMilestone(tx: Tx, goalId: string) {
  const {
    rows: [goal],
  } = await tx.query(
    `SELECT g.*,o.kind AS origin_kind FROM citta.goals g
 JOIN citta.observations o ON o.id=g.observation_id AND o.agent_id=g.agent_id
 WHERE g.id=$1 AND g.agent_id=$2 AND (g.state IN ('completed','exhausted')
 OR g.state='waiting' AND g.wait_reason IN ('operator_input','evidence_or_operator_input'))`,
    [goalId, config.agentId],
  );
  if (!goal) return;
  const {
    rows: [proposal],
  } = await tx.query(
    'SELECT description,state,criteria FROM citta.proposals WHERE agent_id=$1 AND goal_id=$2 ORDER BY created_at DESC LIMIT 1',
    [config.agentId, goalId],
  );
  // Pure reflection and routine one-turn answers are not major milestones.
  if (!proposal && (goal.origin_kind !== 'speech' || goal.cycles < 3)) return;
  const { rows: actions } = await tx.query(
    `SELECT kind,state,count(*)::int AS count FROM citta.actions
 WHERE agent_id=$1 AND goal_id=$2 AND goal_version=$3 AND kind<>'INFER' GROUP BY kind,state ORDER BY kind,state`,
    [config.agentId, goalId, goal.version],
  );
  if (!proposal && !actions.length) return;
  const {
    rows: [latest],
  } = await tx.query(
    'SELECT decision,snapshot FROM citta.decisions WHERE agent_id=$1 AND goal_id=$2 ORDER BY sequence DESC LIMIT 1',
    [config.agentId, goalId],
  );
  const decision = latest?.decision;
  const review = decision?.goalReview;
  const evidence = Array.isArray(latest?.snapshot?.evidence) ? latest.snapshot.evidence : [];
  const cited = new Set<string>(review?.evidenceIds || decision?.evidenceIds || []);
  const counts: Record<string, number> = {};
  for (const e of evidence) if (cited.has(e.id)) counts[e.kind] = (counts[e.kind] || 0) + 1;
  const evidenceText =
    Object.entries(counts)
      .map(([kind, n]) => `${n} ${kind}`)
      .join(', ') || 'No supporting evidence cited';
  const state =
    goal.state === 'completed'
      ? 'completed'
      : goal.state === 'exhausted'
        ? 'blocked'
        : 'waiting for input/evidence';
  const next = proposal
    ? 'Review the proposal in Activity; a proposal does not authorize implementation.'
    : goal.state === 'completed'
      ? 'Review the outcome; tell me if you want a follow-up.'
      : goal.state === 'waiting'
        ? 'Reply to the question in this conversation or open the activity to continue.'
        : 'Open the activity to inspect the blocker before retrying.';
  const text = [
    `Milestone report · ${state}`,
    `Goal: ${String(goal.description).slice(0, 700)}`,
    `Outcome (recorded): ${String(goal.summary || decision?.text || 'No outcome recorded.').slice(0, 1400)}`,
    `Work: ${actions.map((a) => `${a.kind}: ${a.state} (${a.count})`).join('; ') || 'Improvement proposal recorded; no execution implied.'}`,
    `Evidence: ${evidenceText}. Reported claims, adviser output and inferred ideas are not independently verified.`,
    `Open issues: ${proposal ? `Proposal is ${proposal.state}; acceptance check: ${String(proposal.criteria).slice(0, 400)}` : review?.status === 'met' ? 'No unresolved criterion recorded; this does not independently verify the result.' : decision?.uncertainty || 'Completion criterion has not been independently established.'}`,
    `Next: ${next}`,
  ].join('\n\n');
  const { rowCount } = await tx.query(
    `INSERT INTO citta.milestone_reports(id,agent_id,conversation_id,goal_id,goal_version,milestone,text)
 VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
    [randomUUID(), config.agentId, goal.conversation_id, goalId, goal.version, goal.state, text],
  );
  if (rowCount)
    await event(tx, 'milestone_queued', {
      goalId,
      conversationId: goal.conversation_id,
      milestone: goal.state,
      goalVersion: goal.version,
    });
}

export async function deliverMilestone(
  tx: Tx,
  agent: { control: string; quiet: boolean; last_contact_at: unknown },
) {
  if (agent.control !== 'running' || agent.quiet) return;
  await tx.query(
    `UPDATE citta.milestone_reports r SET superseded_at=now() FROM citta.goals g
 WHERE r.agent_id=$1 AND g.id=r.goal_id AND g.agent_id=r.agent_id AND r.delivered_at IS NULL AND r.superseded_at IS NULL
 AND (g.version<>r.goal_version OR g.state='cancelled' OR r.milestone='waiting' AND g.state<>'waiting')`,
    [config.agentId],
  );
  if (
    agent.last_contact_at &&
    Date.now() - new Date(String(agent.last_contact_at)).getTime() < config.contactIntervalMs
  )
    return;
  const {
    rows: [report],
  } = await tx.query(
    `SELECT r.*,g.observation_id FROM citta.milestone_reports r
 JOIN citta.goals g ON g.id=r.goal_id AND g.agent_id=r.agent_id
 WHERE r.agent_id=$1 AND r.delivered_at IS NULL AND r.superseded_at IS NULL ORDER BY r.created_at,r.id LIMIT 1 FOR UPDATE OF r`,
    [config.agentId],
  );
  if (!report) return;
  await tx.query(
    `INSERT INTO citta.messages(id,agent_id,conversation_id,role,text,goal_id,observation_id,source)
 VALUES($1,$2,$3,'citta',$4,$5,$6,'milestone')`,
    [
      randomUUID(),
      config.agentId,
      report.conversation_id,
      report.text,
      report.goal_id,
      report.observation_id,
    ],
  );
  await tx.query(
    'UPDATE citta.milestone_reports SET delivered_at=now() WHERE id=$1 AND agent_id=$2',
    [report.id, config.agentId],
  );
  await tx.query('UPDATE citta.agents SET last_contact_at=now() WHERE id=$1', [config.agentId]);
  agent.last_contact_at = new Date();
  await event(tx, 'message', {
    conversationId: report.conversation_id,
    goalId: report.goal_id,
    source: 'milestone',
    reportId: report.id,
  });
}
