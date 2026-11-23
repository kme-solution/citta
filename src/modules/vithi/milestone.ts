import { randomUUID } from 'node:crypto';
import { config } from '../../app/config.ts';
import { event, type Tx } from '../../infra/postgres/database.ts';

/** Reports describe persisted work, not an extra model's interpretation of success. */
export async function retainMilestone(tx: Tx, goalId: string) {
  const {
    rows: [goal],
  } = await tx.query(
    `SELECT g.*,o.kind AS origin_kind,o.payload AS origin_payload FROM citta.goals g
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
  const {
    rows: [latest],
  } = await tx.query(
    'SELECT decision,snapshot FROM citta.decisions WHERE agent_id=$1 AND goal_id=$2 ORDER BY sequence DESC LIMIT 1',
    [config.agentId, goalId],
  );
  const sourceId =
    goal.origin_kind === 'mental' ? goal.origin_payload?.focus?.sourceGoalId : undefined;
  const {
    rows: [source],
  } = sourceId
    ? await tx.query(
        `SELECT g.* FROM citta.goals g JOIN citta.observations o ON o.id=g.observation_id AND o.agent_id=g.agent_id
     JOIN citta.focuses f ON f.source_goal_id=g.id AND f.agent_id=g.agent_id AND f.source_goal_version=g.version
     WHERE g.id=$1 AND g.agent_id=$2 AND f.id=$3 AND o.kind='speech' AND g.state IN ('active','waiting','suspended','completed')`,
        [sourceId, config.agentId, goal.origin_payload.focus.id],
      )
    : { rows: [undefined] };
  const focusReview = latest?.decision?.focusReview;
  const followup =
    !!source &&
    (['settled', 'blocked'].includes(focusReview?.status) ||
      (goal.state === 'waiting' && latest?.decision?.action === 'CLARIFY'));
  // A fresh thought or timer tick is not a reportable result.
  if (goal.origin_kind === 'mental' && !followup && !proposal) return;
  if (!proposal && !followup && (goal.origin_kind !== 'speech' || goal.cycles < 3)) return;
  const { rows: actions } = await tx.query(
    `SELECT kind,state,count(*)::int AS count FROM citta.actions
     WHERE agent_id=$1 AND ((goal_id=$2 AND goal_version=$3) OR goal_id=$4::uuid) AND kind<>'INFER'
     GROUP BY kind,state ORDER BY kind,state`,
    [config.agentId, goalId, goal.version, followup ? source.id : null],
  );
  if (!proposal && !followup && !actions.length) return;
  const {
    rows: [lastOutcome],
  } = followup
    ? await tx.query(
        `SELECT id FROM citta.actions WHERE agent_id=$1 AND goal_id IN ($2,$3) AND kind<>'INFER'
     AND result IS NOT NULL AND state IN ('succeeded','failed','unknown','denied')
     ORDER BY finished_at DESC,id DESC LIMIT 1`,
        [config.agentId, goalId, source.id],
      )
    : { rows: [undefined] };
  const {
    rows: [discussion],
  } =
    followup && !lastOutcome
      ? await tx.query(
          `SELECT id,count(*) OVER()::int AS messages FROM citta.messages
     WHERE agent_id=$1 AND goal_id=$2 AND role='operator' ORDER BY ordinal DESC LIMIT 1`,
          [config.agentId, source.id],
        )
      : { rows: [undefined] };
  const resultMarker = lastOutcome
    ? 'operation:' + lastOutcome.id
    : discussion?.messages >= 2
      ? 'discussion:' + discussion.id
      : null;
  if (followup && !resultMarker) return;
  const reportKey = followup
    ? JSON.stringify(['followup-v1', source.id, source.version, goal.state, resultMarker])
    : null;
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
  const state = followup
    ? focusReview?.status === 'blocked'
      ? 'blocked'
      : source.state === 'completed'
        ? 'reviewed outcome'
        : 'reviewed concern'
    : goal.state === 'completed'
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
    `${followup ? 'Conversation follow-up' : 'Milestone report'} · ${state}`,
    `Goal: ${String(followup ? source.description : goal.description).slice(0, 700)}`,
    `Outcome (recorded): ${String(goal.summary || decision?.text || 'No outcome recorded.').slice(0, 1400)}`,
    `Work: ${actions.map((a) => `${a.kind}: ${a.state} (${a.count})`).join('; ') || (followup ? 'Review of sourced conversation; no external operation implied.' : 'Improvement proposal recorded; no execution implied.')}`,
    `Evidence: ${evidenceText}. Reported claims, adviser output and inferred ideas are not independently verified.`,
    `Open issues: ${followup ? `Original recorded task state: ${source.state}; criterion: ${String(source.criterion).slice(0, 400)}. ${decision?.uncertainty || 'This review does not independently verify task success.'}` : proposal ? `Proposal is ${proposal.state}; acceptance check: ${String(proposal.criteria).slice(0, 400)}` : review?.status === 'met' ? 'No unresolved criterion recorded; this does not independently verify the result.' : decision?.uncertainty || 'Completion criterion has not been independently established.'}`,
    `Next: ${followup ? focusReview?.nextStep || next : next}`,
  ].join('\n\n');
  const { rowCount } = await tx.query(
    `INSERT INTO citta.milestone_reports(id,agent_id,conversation_id,goal_id,goal_version,milestone,text,source_goal_id,source_goal_version,report_key)
 VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT DO NOTHING`,
    [
      randomUUID(),
      config.agentId,
      followup ? source.conversation_id : goal.conversation_id,
      goalId,
      goal.version,
      goal.state,
      text,
      followup ? source.id : null,
      followup ? source.version : null,
      reportKey,
    ],
  );
  if (rowCount)
    await event(tx, 'milestone_queued', {
      goalId,
      conversationId: followup ? source.conversation_id : goal.conversation_id,
      sourceGoalId: followup ? source.id : undefined,
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
  await tx.query(
    `UPDATE citta.milestone_reports r SET superseded_at=now() FROM citta.goals g
     WHERE r.agent_id=$1 AND r.source_goal_id=g.id AND g.agent_id=r.agent_id
     AND r.delivered_at IS NULL AND r.superseded_at IS NULL
     AND (g.version<>r.source_goal_version OR g.state IN ('cancelled','exhausted'))`,
    [config.agentId],
  );
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
