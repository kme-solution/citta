import { test } from 'node:test';
import assert from 'node:assert/strict';
import { workBudgetAvailable } from '../src/modules/vithi/work-budget.ts';
import { mindStatus } from '../src/modules/vithi/mind-status.ts';
const base = {
  control: 'running',
  enabled: true,
  providerReady: true,
  runnerReady: true,
  workUsed: 71,
  hourlyLimit: 120,
  actions: [],
  pendingInputs: 0,
  enabledMotives: 4,
  now: '2026-11-22T10:00:00Z',
};
test('initiative can use the full allowance; zero explicitly permits continuous work', () => {
  assert.equal(workBudgetAvailable(71, 120), true);
  assert.equal(workBudgetAvailable(120, 120), false);
  assert.equal(workBudgetAvailable(120000, 0), true);
});
test('quiet continuity is ready without fabricating a completed thought; actual blocks are explicit', () => {
  assert.equal(mindStatus(base).state, 'ready');
  assert.equal(mindStatus({ ...base, hourlyLimit: 0, workUsed: 99999 }).state, 'ready');
  assert.equal(mindStatus({ ...base, workUsed: 120 }).state, 'budget_paused');
  assert.equal(mindStatus({ ...base, providerReady: false }).state, 'waiting_provider');
  assert.equal(mindStatus({ ...base, control: 'paused' }).state, 'paused');
  assert.equal(mindStatus({ ...base, runnerReady: false }).state, 'unavailable');
  assert.equal(mindStatus({ ...base, enabledMotives: 0 }).state, 'no_motive');
});
test('mind reports actual running inference and result review ahead of idle readiness', () => {
  const current = mindStatus({
    ...base,
    actions: [{ id: 'a', kind: 'INFER', state: 'running', goal_id: 'g', started_at: base.now }],
  });
  assert.equal(current.state, 'considering');
  assert.equal(current.goalId, 'g');
  assert.equal(mindStatus({ ...base, pendingInputs: 1 }).state, 'reviewing');
  assert.equal(
    mindStatus({
      ...base,
      actions: [{ id: 'a', kind: 'COMPUTER', state: 'running', goal_id: 'g' }],
    }).state,
    'acting',
  );
});
