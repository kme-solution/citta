import { CONTEXT_SELECTION_POLICY } from '../sati/context-selection.ts';
import { createHash, randomUUID } from 'node:crypto';
import { config } from '../../app/config.ts';
import { event, type Tx } from '../../infra/postgres/database.ts';
import type { Context, Decision } from '../../contracts/runtime.ts';
type Row = Record<string, any>;

/** Called under the agent lock: focus is agent-wide, not a per-conversation persona. */
export async function continuingFocus(
  tx: Tx,
  conversationId: string,
  profileId: string,
  desktopConnected: boolean,
): Promise<{ focus: Row; motive: Row } | null> {
  let {
    rows: [focus],
  } = await tx.query("SELECT * FROM citta.focuses WHERE agent_id=$1 AND state='active'", [
    config.agentId,
  ]);
  if (focus) {
    const {
      rows: [motive],
    } = await tx.query('SELECT * FROM citta.motives WHERE agent_id=$1 AND id=$2 AND enabled', [
      config.agentId,
      focus.motive_id,
    ]);
    const {
      rows: [goal],
    } = focus.source_goal_id
      ? await tx.query(
          "SELECT g.state,g.version,EXISTS(SELECT 1 FROM citta.actions a WHERE a.agent_id=g.agent_id AND a.goal_id=g.id AND a.state='unknown') AS unknown_effect FROM citta.goals g WHERE g.agent_id=$1 AND g.id=$2",
          [config.agentId, focus.source_goal_id],
        )
      : { rows: [undefined] };
    const {
      rows: [memory],
    } = focus.source_memory_id
      ? await tx.query('SELECT valid FROM citta.memories WHERE id=$1 AND agent_id=$2', [
          focus.source_memory_id,
          config.agentId,
        ])
      : { rows: [undefined] };
    const eligible =
      motive &&
      (!focus.source_memory_id || memory?.valid) &&
      (!focus.source_goal_id ||
        (goal &&
          goal.version === focus.source_goal_version &&
          ['active', 'waiting', 'suspended'].includes(goal.state) &&
          !goal.unknown_effect));
    if (eligible) return { focus, motive };
    const reason = !motive
      ? 'The supporting interest was disabled.'
      : 'The source concern changed, became invalid, was closed or has an uncertain effect; this focus cannot resume it.';
    await tx.query(
      "UPDATE citta.focuses SET state='settled',reason=$3,version=version+1,updated_at=now() WHERE id=$1 AND agent_id=$2",
      [focus.id, config.agentId, reason],
    );
    await event(tx, 'focus_released', { focusId: focus.id, reason });
  }
  // A deliberate exploration can defer a concern; return to it after that exploration ends.
  const {
    rows: [last],
  } = await tx.query(
    'SELECT state FROM citta.focuses WHERE agent_id=$1 ORDER BY updated_at DESC,id LIMIT 1',
    [config.agentId],
  );
  const exploring = last?.state === 'deferred';
  if (!exploring) {
    const {
      rows: [saved],
    } = await tx.query(
      `SELECT f.* FROM citta.focuses f JOIN citta.motives m ON m.id=f.motive_id AND m.agent_id=f.agent_id
  LEFT JOIN citta.goals g ON g.id=f.source_goal_id AND g.agent_id=f.agent_id
  WHERE f.agent_id=$1 AND f.state='deferred' AND m.enabled
  AND (f.source_memory_id IS NULL OR EXISTS(SELECT 1 FROM citta.memories n WHERE n.id=f.source_memory_id AND n.agent_id=f.agent_id AND n.valid))
  AND (f.source_goal_id IS NULL OR g.version=f.source_goal_version AND g.state IN ('active','waiting','suspended') AND NOT EXISTS(SELECT 1 FROM citta.actions a WHERE a.agent_id=g.agent_id AND a.goal_id=g.id AND a.state='unknown'))
  ORDER BY f.updated_at,f.id LIMIT 1`,
      [config.agentId],
    );
    if (saved) {
      const {
        rows: [resumed],
      } = await tx.query(
        "UPDATE citta.focuses SET state='active',version=version+1,reason='Return to the retained concern after exploration.',updated_at=now() WHERE id=$1 AND agent_id=$2 RETURNING *",
        [saved.id, config.agentId],
      );
      const {
        rows: [motive],
      } = await tx.query('SELECT * FROM citta.motives WHERE id=$1 AND agent_id=$2', [
        saved.motive_id,
        config.agentId,
      ]);
      await event(tx, 'focus_resumed', { focusId: saved.id, reason: resumed.reason });
      return { focus: resumed, motive };
    }
  }
  const {
    rows: [notes],
  } = await tx.query(
    "SELECT count(*)::text AS count,max(created_at)::text AS latest FROM citta.memories WHERE agent_id=$1 AND valid AND kind IN ('configured','reported','observed','commitment')",
    [config.agentId],
  );
  const signature = createHash('sha256')
    .update(
      JSON.stringify({
        profileId,
        notes,
        desktopConnected,
        contextSelection: CONTEXT_SELECTION_POLICY,
      }),
    )
    .digest('hex');
  const {
    rows: [concern],
  } = await tx.query(
    `SELECT g.id,g.version,g.description,g.conversation_id,g.observation_id FROM citta.goals g
 JOIN citta.observations o ON o.id=g.observation_id AND o.agent_id=g.agent_id
 WHERE g.agent_id=$1 AND NOT $3::boolean AND o.kind='speech' AND g.state IN ('active','waiting','suspended')
 AND NOT EXISTS(SELECT 1 FROM citta.actions a WHERE a.agent_id=g.agent_id AND a.goal_id=g.id AND a.state='unknown')
 AND NOT EXISTS(SELECT 1 FROM citta.focuses f WHERE f.agent_id=g.agent_id AND f.source_goal_id=g.id
 AND f.source_goal_version=g.version AND f.context_signature=$2 AND f.updated_at>=g.updated_at)
 ORDER BY g.created_at DESC,g.id LIMIT 1`,
    [config.agentId, signature, exploring],
  );
  const {
    rows: [remembered],
  } =
    !concern && !exploring
      ? await tx.query(
          `SELECT n.id,n.content,n.conversation_id,n.source_id FROM citta.memories n
 JOIN citta.observations o ON o.id=n.source_id AND o.agent_id=n.agent_id AND o.kind='speech'
 WHERE n.agent_id=$1 AND n.valid AND n.kind IN ('reported','commitment')
 AND NOT EXISTS(SELECT 1 FROM citta.focuses f WHERE f.agent_id=n.agent_id AND f.source_memory_id=n.id AND f.context_signature=$2)
 ORDER BY n.created_at DESC,n.id LIMIT 1`,
          [config.agentId, signature],
        )
      : { rows: [undefined] };
  const {
    rows: [motive],
  } = await tx.query(
    `SELECT m.* FROM citta.motives m WHERE m.agent_id=$1 AND m.enabled
 AND (m.conversation_id IS NULL OR m.conversation_id=$2 OR m.conversation_id=$3)
 ORDER BY (SELECT max(f.updated_at) FROM citta.focuses f WHERE f.agent_id=m.agent_id AND f.motive_id=m.id) NULLS FIRST,m.turns,m.id LIMIT 1`,
    [
      config.agentId,
      conversationId,
      concern?.conversation_id || remembered?.conversation_id || conversationId,
    ],
  );
  if (!motive) return null;
  const reason = concern
    ? 'Retain an unresolved operator concern across internal turns.'
    : remembered
      ? 'Develop a sourced remembered concern; it is not approval or proof of an outcome.'
      : 'Choose a concrete question from an enabled interest; retain a return point for deliberate exploration.';
  const {
    rows: [created],
  } = await tx.query(
    `INSERT INTO citta.focuses(id,agent_id,conversation_id,motive_id,source_goal_id,source_goal_version,source_observation_id,context_signature,topic,reason,source_memory_id)
 VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [
      randomUUID(),
      config.agentId,
      concern?.conversation_id || remembered?.conversation_id || conversationId,
      motive.id,
      concern?.id || null,
      concern?.version || null,
      concern?.observation_id || remembered?.source_id || motive.source_observation_id || null,
      signature,
      concern?.description ||
        (remembered
          ? 'Consider this remembered concern: ' + remembered.content.slice(0, 900)
          : motive.description),
      reason,
      remembered?.id || null,
    ],
  );
  await event(tx, 'focus_selected', {
    focusId: created.id,
    sourceGoalId: concern?.id || null,
    topic: created.topic,
    reason,
  });
  return { focus: created, motive };
}

export async function advanceFocus(tx: Tx, ctx: Context, decision: Decision) {
  const focus = ctx.focus,
    review = decision.focusReview;
  if (!focus || !review) return;
  const state = ['CLARIFY', 'WAIT'].includes(decision.action)
    ? 'blocked'
    : review.status === 'continue'
      ? 'active'
      : review.status === 'defer'
        ? 'deferred'
        : review.status;
  const reason = ['CLARIFY', 'WAIT'].includes(decision.action)
    ? 'Waiting for a recorded answer or due condition. ' + review.reason
    : review.reason;
  const { rowCount } = await tx.query(
    `UPDATE citta.focuses SET state=$4,last_outcome=$5,next_step=$6,reason=$7,
 topic=CASE WHEN source_goal_id IS NULL AND source_memory_id IS NULL AND turns=0 THEN $5 ELSE topic END,
 turns=turns+1,version=version+1,updated_at=now() WHERE id=$1 AND agent_id=$2 AND version=$3 AND state='active'`,
    [
      focus.id,
      config.agentId,
      focus.version,
      state,
      (decision.text || decision.reason).slice(0, 1000),
      review.nextStep,
      reason,
    ],
  );
  if (!rowCount) throw Error('The continuing focus changed before its review could commit.');
  if (rowCount) {
    ctx.focus = {
      ...focus,
      topic:
        !focus.sourceGoalId && !focus.sourceMemoryId && focus.turns === 0
          ? (decision.text || decision.reason).slice(0, 1000)
          : focus.topic,
      version: focus.version + 1,
      lastOutcome: (decision.text || decision.reason).slice(0, 1000),
      nextStep: review.nextStep,
      turns: focus.turns + 1,
      reason,
    };
  }
  if (rowCount)
    await event(tx, 'focus_reviewed', {
      focusId: focus.id,
      state,
      reason,
      nextStep: review.nextStep,
      goalId: ctx.goalId,
    });
}

export async function currentFocus(tx: Tx, focus: NonNullable<Context['focus']>) {
  const { rowCount } = await tx.query(
    `SELECT 1 FROM citta.focuses f JOIN citta.motives m ON m.id=f.motive_id AND m.agent_id=f.agent_id
 LEFT JOIN citta.goals g ON g.id=f.source_goal_id AND g.agent_id=f.agent_id
 WHERE f.agent_id=$1 AND f.id=$2 AND f.version=$3 AND f.state='active' AND m.enabled
 AND (f.source_memory_id IS NULL OR EXISTS(SELECT 1 FROM citta.memories n WHERE n.id=f.source_memory_id AND n.agent_id=f.agent_id AND n.valid))
 AND (f.source_goal_id IS NULL OR g.version=f.source_goal_version AND g.state IN ('active','waiting','suspended') AND NOT EXISTS(SELECT 1 FROM citta.actions a WHERE a.agent_id=g.agent_id AND a.goal_id=g.id AND a.state='unknown'))`,
    [config.agentId, focus.id, focus.version],
  );
  return !!rowCount;
}
