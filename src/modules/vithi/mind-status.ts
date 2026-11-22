import { workBudgetAvailable } from './work-budget.ts';
interface Action {
  id: string;
  kind: string;
  state: string;
  goal_id: string;
  started_at?: string;
  created_at?: string;
}
export interface MindStatus {
  state: string;
  reason: string;
  goalId?: string;
  since?: string;
  hourlyLimit: number;
  workUsed: number;
  observedAt: string;
}
export function mindStatus(input: {
  control: string;
  enabled: boolean;
  providerReady: boolean;
  runnerReady: boolean;
  workUsed: number;
  hourlyLimit: number;
  actions: Action[];
  pendingInputs: number;
  enabledMotives: number;
  providerReason?: string;
  providerProgress?: { actionId?: string; phase: string; startedAt: string; updatedAt: string }[];
  now: string;
}): MindStatus {
  const base = { hourlyLimit: input.hourlyLimit, workUsed: input.workUsed, observedAt: input.now };
  if (input.control !== 'running')
    return {
      ...base,
      state: input.control,
      reason:
        input.control === 'paused'
          ? 'The operator paused consideration; retained context is preserved.'
          : 'The operator stopped processing. Resume to continue.',
    };
  if (!input.runnerReady)
    return {
      ...base,
      state: 'unavailable',
      reason: 'The runner heartbeat is unavailable; new progress is not confirmed.',
    };
  const current =
    input.actions.find((a) => a.state === 'running') ||
    input.actions.find((a) => a.state === 'queued');
  const progress = current
    ? input.providerProgress?.find((p) => p.actionId === current.id)
    : undefined;
  if (current && progress && current.kind === 'INFER')
    return {
      ...base,
      state: 'considering',
      reason:
        progress.phase === 'provider_retry'
          ? 'Codex is retrying its provider connection; no completed outcome is available.'
          : progress.phase === 'reasoning'
            ? 'Codex is considering the selected object; the next outcome is pending.'
            : progress.phase === 'responding'
              ? 'Codex is returning a proposal; it is not committed yet.'
              : 'Waiting for Codex provider output for the selected object.',
      goalId: current.goal_id,
      since: progress.startedAt,
    };
  if (current)
    return {
      ...base,
      state: current.kind === 'INFER' ? 'considering' : 'acting',
      reason:
        current.state === 'queued'
          ? 'The next operation is queued.'
          : 'INFER' === current.kind
            ? 'Codex/local consideration is in progress.'
            : 'An ability is executing; its outcome has not yet been reviewed.',
      goalId: current.goal_id,
      since: current.started_at || current.created_at,
    };
  if (input.pendingInputs)
    return {
      ...base,
      state: 'reviewing',
      reason:
        'Accepted input or an operation result is waiting for the next serialized consideration.',
    };
  if (!input.enabled)
    return {
      ...base,
      state: 'disabled',
      reason: 'Cognition is disabled in the current configuration.',
    };
  if (!input.providerReady)
    return {
      ...base,
      state: 'waiting_provider',
      reason:
        input.providerReason ||
        'The reasoning provider is not connected or is unavailable. Context and memory are retained.',
    };
  if (!workBudgetAvailable(input.workUsed, input.hourlyLimit))
    return {
      ...base,
      state: 'budget_paused',
      reason:
        'The configured hourly work allowance is exhausted. Processing can continue when the allowance resets or is changed.',
    };
  if (!input.enabledMotives)
    return {
      ...base,
      state: 'no_motive',
      reason: 'No enabled interest is available to originate the next consideration.',
    };
  return {
    ...base,
    state: 'ready',
    reason:
      'Retaining current context and selecting the next eligible interest or remembered concern.',
  };
}
