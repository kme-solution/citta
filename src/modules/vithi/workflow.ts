import { proxyActivities, defineSignal, setHandler, condition, continueAsNew, workflowInfo, uuid4 } from '@temporalio/workflow';
import type * as activities from './activities.ts';
const short = proxyActivities<Pick<typeof activities,'cycle'>>({startToCloseTimeout:'30 seconds',retry:{initialInterval:'1 second',maximumInterval:'15 seconds'}});
const long = proxyActivities<Pick<typeof activities,'perform'>>({startToCloseTimeout:'12 minutes',heartbeatTimeout:'30 seconds',retry:{maximumAttempts:1}});
export const wake = defineSignal('wake');
/** Only this loop invokes consideration. Pending effects do not own the foreground. */
export async function cittaVithi(generation: string) {
  let notified = true;
  let turns = 0;
  const active = new Set<string>();
  setHandler(wake,()=>{notified=true;});
  for (;;) {
    notified=false;
    const result = await short.cycle(uuid4(),generation);
    if(result.fenced)return;
    for (const work of result.work) {
      if (active.has(work.id)) continue;
      active.add(work.id);
      void long.perform(work.id).catch(()=>{/* SQL heartbeat recovery makes lost effects explicit. */}).finally(()=>{active.delete(work.id);notified=true;});
    }
    if (++turns>=500 && active.size===0 && workflowInfo().continueAsNewSuggested) await continueAsNew<typeof cittaVithi>(generation);
    // Reconciliation is bounded; correctness does not depend on wakeup delivery.
    await condition(()=>notified,'1 second');
  }
}
