import { config } from '../../app/config.ts';
import type { Tx } from './database.ts';
export async function pauseCommitments(tx: Tx) {
  await tx.query(
    "UPDATE citta.goals SET resume_state=state,state='paused',updated_at=now() WHERE agent_id=$1 AND state IN ('active','suspended','waiting')",
    [config.agentId],
  );
  await tx.query(
    "UPDATE citta.frames SET checkpoint=checkpoint||jsonb_build_object('resumeState',state),state='paused',version=version+1,updated_at=now() WHERE agent_id=$1 AND state IN ('foreground','suspended','waiting')",
    [config.agentId],
  );
}
export async function resumeCommitments(tx: Tx) {
  await tx.query(
    "UPDATE citta.goals SET state=COALESCE(resume_state,'waiting'),resume_state=NULL,updated_at=now() WHERE agent_id=$1 AND state='paused'",
    [config.agentId],
  );
  await tx.query(
    "UPDATE citta.frames f SET state=CASE WHEN checkpoint->>'resumeState' IN ('foreground','suspended','waiting') THEN checkpoint->>'resumeState' ELSE 'waiting' END,checkpoint=checkpoint-'resumeState',version=f.version+1,updated_at=now() FROM citta.goals g WHERE f.agent_id=$1 AND f.state='paused' AND g.id=f.goal_id AND g.state NOT IN ('cancelled','completed','exhausted')",
    [config.agentId],
  );
}
