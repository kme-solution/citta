import { workBudgetAvailable } from '../../modules/vithi/work-budget.ts';
import { randomUUID } from 'node:crypto';
import { config } from '../../app/config.ts';
import type { Work, Outcome } from '../../contracts/runtime.ts';
import { transaction, lockAgent, pool, event } from './database.ts';
import { resultObservation } from '../../modules/vithi/cycle.ts';
import { authorize } from '../../modules/sikkha/authorize.ts';
export async function claimAction(id: string): Promise<{ work: Work; token: string } | null> {
  return transaction(async (tx) => {
    const agent = await lockAgent(tx);
    const {
      rows: [a],
    } = await tx.query(
      'SELECT a.*,g.version AS current_goal_version,g.state AS goal_state,g.work_ms,g.budget_ms FROM citta.actions a JOIN citta.goals g ON g.id=a.goal_id WHERE a.id=$1 AND a.agent_id=$2 FOR UPDATE OF a',
      [id, config.agentId],
    );
    if (!a || a.state !== 'queued' || agent.control !== 'running') return null;
    if (
      a.goal_version !== a.current_goal_version ||
      ['cancelled', 'completed', 'exhausted'].includes(a.goal_state) ||
      String(a.generation) !== String(agent.generation)
    ) {
      await tx.query("UPDATE citta.actions SET state='cancelled',finished_at=now() WHERE id=$1", [
        id,
      ]);
      return null;
    }
    let denial: string | undefined;
    try {
      authorize(a.kind, a.context, a.argument, config.adviserEnabled);
      if (a.kind === 'INFER' && !config.cognitionEnabled)
        throw Error('Local cognition was disabled before dispatch.');
      if (Number(a.work_ms) >= Number(a.budget_ms))
        throw Error('Goal active-work budget exhausted before dispatch.');
    } catch (error) {
      denial = error instanceof Error ? error.message : 'Dispatch denied.';
    }
    if (denial) {
      await tx.query(
        "UPDATE citta.actions SET state='denied',result=$2,finished_at=now() WHERE id=$1",
        [id, JSON.stringify({ ok: false, error: denial })],
      );
      await resultObservation(tx, id, a.goal_id);
      await event(tx, 'dispatch_denied', { actionId: id, reason: denial });
      return null;
    }
    const {
      rows: [busy],
    } = await tx.query(
      "SELECT id FROM citta.actions WHERE agent_id=$1 AND kind=$2 AND state='running' LIMIT 1",
      [config.agentId, a.kind],
    );
    if (busy) return null;
    const {
      rows: [next],
    } = await tx.query(
      "SELECT id FROM citta.actions WHERE agent_id=$1 AND kind=$2 AND state='queued' ORDER BY CASE WHEN yields>=3 OR created_at<=now()-interval '1 minute' THEN 0 WHEN context->>'kind'='speech' THEN 1 ELSE 2 END, CASE WHEN yields>=3 OR created_at<=now()-interval '1 minute' THEN created_at END ASC,created_at DESC,id LIMIT 1",
      [config.agentId, a.kind],
    );
    if (next?.id !== id) return null;
    const token = randomUUID();
    await tx.query(
      "UPDATE citta.actions SET state='running',claim_token=$2,heartbeat_at=now(),started_at=now(),control_version=$3,attempts=attempts+1 WHERE id=$1",
      [id, token, agent.control_version],
    );
    await tx.query(
      "INSERT INTO citta.attempts(action_id,number,claim_token,state) VALUES($1,$2,$3,'running')",
      [id, a.attempts + 1, token],
    );
    await event(tx, 'dispatch', {
      actionId: id,
      kind: a.kind,
      goalId: a.goal_id,
      controlVersion: agent.control_version,
    });
    return {
      work: {
        id,
        kind: a.kind,
        argument: a.argument,
        context: a.context,
        goalId: a.goal_id,
        goalVersion: a.goal_version,
      },
      token,
    };
  });
}
export async function actionAlive(id: string, token: string) {
  const {
    rows: [row],
  } = await pool.query(
    "UPDATE citta.actions a SET heartbeat_at=now() FROM citta.goals g,citta.agents r WHERE a.id=$1 AND a.claim_token=$2 AND a.state='running' AND a.agent_id=$3 AND g.id=a.goal_id AND r.id=a.agent_id RETURNING g.state,g.version,a.goal_version,r.control,a.kind,a.yields,a.created_at",
    [id, token, config.agentId],
  );
  if (
    !row ||
    row.state === 'cancelled' ||
    row.version !== row.goal_version ||
    row.control === 'stopped'
  )
    return 'cancel' as const;
  if (
    row.kind === 'INFER' &&
    row.yields < 3 &&
    Date.now() - new Date(row.created_at).getTime() < 60000 &&
    row.control === 'running'
  ) {
    const {
      rows: [newer],
    } = await pool.query(
      "SELECT id FROM citta.actions WHERE agent_id=$1 AND kind='INFER' AND state='queued' AND context->>'kind'='speech' AND created_at>$2 LIMIT 1",
      [config.agentId, row.created_at],
    );
    if (newer) return 'yield' as const;
  }
  return 'alive' as const;
}
export async function yieldAction(id: string, token: string) {
  return transaction(async (tx) => {
    const agent = await lockAgent(tx);
    const {
      rows: [a],
    } = await tx.query(
      'SELECT a.*,g.state AS goal_state FROM citta.actions a JOIN citta.goals g ON g.id=a.goal_id WHERE a.id=$1 AND a.agent_id=$2 FOR UPDATE OF a',
      [id, config.agentId],
    );
    if (!a || a.state !== 'running' || a.claim_token !== token) return;
    await tx.query(
      'UPDATE citta.goals SET work_ms=work_ms+GREATEST(0,EXTRACT(epoch FROM (now()-$2::timestamptz))*1000)::bigint WHERE id=$1',
      [a.goal_id, a.started_at],
    );
    await tx.query(
      "UPDATE citta.attempts SET state='yielded',finished_at=now(),usage=$3 WHERE action_id=$1 AND claim_token=$2",
      [
        id,
        token,
        JSON.stringify({
          usageUnknown: true,
          reason: 'Foreground input interrupted incomplete local generation.',
        }),
      ],
    );
    if (
      agent.control !== 'running' ||
      a.goal_state === 'cancelled' ||
      !workBudgetAvailable(agent.work_used, config.hourlyWorkLimit)
    ) {
      await tx.query(
        "UPDATE citta.actions SET state='failed',result=$2,finished_at=now() WHERE id=$1",
        [
          id,
          JSON.stringify({
            ok: false,
            error: 'Interrupted generation could not resume within current controls/work budget.',
          }),
        ],
      );
      await resultObservation(tx, id, a.goal_id);
      return;
    }
    await tx.query(
      "UPDATE citta.actions SET state='queued',yields=yields+1,claim_token=NULL,heartbeat_at=NULL,started_at=NULL WHERE id=$1",
      [id],
    );
    await tx.query('UPDATE citta.agents SET work_used=work_used+1 WHERE id=$1', [config.agentId]);
    await event(tx, 'inference_yielded', {
      actionId: id,
      goalId: a.goal_id,
      remainingResumptions: 2 - a.yields,
      usageUnknown: true,
    });
  });
}
export async function finishAction(id: string, token: string, result: Outcome) {
  return transaction(async (tx) => {
    await lockAgent(tx);
    const {
      rows: [a],
    } = await tx.query('SELECT * FROM citta.actions WHERE id=$1 AND agent_id=$2 FOR UPDATE', [
      id,
      config.agentId,
    ]);
    if (!a || a.state !== 'running' || a.claim_token !== token) return;
    await tx.query(
      'UPDATE citta.goals SET work_ms=work_ms+GREATEST(0,EXTRACT(epoch FROM (now()-$2::timestamptz))*1000)::bigint WHERE id=$1',
      [a.goal_id, a.started_at],
    );
    await tx.query('UPDATE citta.actions SET state=$2,result=$3,finished_at=now() WHERE id=$1', [
      id,
      result.unknown ? 'unknown' : result.ok ? 'succeeded' : 'failed',
      JSON.stringify(result),
    ]);
    await tx.query(
      'UPDATE citta.attempts SET state=$3,finished_at=now(),usage=$4 WHERE action_id=$1 AND claim_token=$2',
      [
        id,
        token,
        result.unknown ? 'unknown' : result.ok ? 'succeeded' : 'failed',
        JSON.stringify(result.usage || {}),
      ],
    );
    await resultObservation(tx, id, a.goal_id);
    await event(tx, 'effect', {
      actionId: id,
      kind: a.kind,
      ok: result.ok,
      unknown: !!result.unknown,
      error: result.error,
      usage: result.usage,
    });
  });
}
