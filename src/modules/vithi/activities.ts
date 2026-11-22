import { config } from '../../app/config.ts';
import { ComputerFailure } from '../../infra/computer/desktop.ts';
import { heartbeat, Context as ActivityContext } from '@temporalio/activity';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { cycle } from './cycle.ts';
import {
  claimAction,
  actionAlive,
  finishAction,
  yieldAction,
} from '../../infra/postgres/actions.ts';
import { executeAbility } from '../kamma/abilities.ts';
import { AdviserFailure } from '../cetana/vaca-codex.ts';
export { cycle };
export async function perform(id: string) {
  const claimed = await claimAction(id);
  if (!claimed) return;
  const abort = new AbortController();
  const span = trace.getTracer('citta').startSpan('kamma.' + claimed.work.kind);
  span.setAttribute('action.id', id);
  let checking = false;
  let yielded = false;
  const started = Date.now();
  const pulse = setInterval(() => {
    heartbeat({ actionId: id });
    if (checking) return;
    checking = true;
    actionAlive(id, claimed.token)
      .then((state) => {
        if (state === 'yield') yielded = true;
        if (state !== 'alive') abort.abort();
      })
      .catch(() => abort.abort())
      .finally(() => {
        checking = false;
      });
  }, 3000);
  const context = ActivityContext.current();
  void context.cancelled.catch(() => abort.abort());
  try {
    const outcome = await executeAbility(claimed.work, abort.signal);
    await finishAction(id, claimed.token, {
      ...outcome,
      usage: { ...((outcome.usage as object) || {}), wallMs: Date.now() - started },
    });
    span.setStatus({ code: outcome.ok ? SpanStatusCode.OK : SpanStatusCode.ERROR });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ability failed.';
    if (yielded) await yieldAction(id, claimed.token);
    else
      await finishAction(id, claimed.token, {
        ok: false,
        error: message,
        unknown:
          (claimed.work.kind === 'CONSULT_AI' &&
            (!(error instanceof AdviserFailure) || error.effectUncertain)) ||
          (claimed.work.kind === 'COMPUTER' &&
            (!(error instanceof ComputerFailure) || error.effectUncertain)),
        usage: {
          ...(claimed.work.kind === 'INFER' ? { provider: config.cognitionProvider } : {}),
          wallMs: Date.now() - started,
          usageUnknown:
            !(error instanceof AdviserFailure || error instanceof ComputerFailure) ||
            error.effectUncertain,
        },
      });
    span.setStatus({ code: SpanStatusCode.ERROR, message });
  } finally {
    clearInterval(pulse);
    span.end();
  }
}
