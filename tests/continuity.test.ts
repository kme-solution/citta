import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectOpportunity } from '../src/modules/vithi/select-opportunity.ts';
import { nextMotiveEligibility } from '../src/modules/chanda/eligibility.ts';
import { replayContact } from '../src/modules/vithi/contact-policy.ts';
import {
  replayContinuity,
  type ContinuityArchive,
} from '../src/modules/vithi/continuity-replay.ts';
const now = '2026-11-22T01:00:00Z';
test('operator interruption quota gives an old obligation a protected turn without losing inputs', () => {
  const candidates = [
    { id: 'speech', kind: 'speech' as const, createdAt: now, continuation: false },
    {
      id: 'result',
      kind: 'result' as const,
      createdAt: '2026-11-22T00:59:00Z',
      continuation: true,
    },
  ];
  assert.equal(selectOpportunity(candidates, 0, now)?.selectedId, 'speech');
  const selection = selectOpportunity(candidates, 3, now)!;
  assert.equal(selection.selectedId, 'result');
  assert.equal(selection.candidates.length, 2);
});
test('unchanged causal context backs off; changed evidence restores eligibility and long backoff is bounded', () => {
  const initial = nextMotiveEligibility({
    sameContext: false,
    unchangedTurns: 0,
    intervalMs: 300000,
    now,
  });
  const repeated = nextMotiveEligibility({
    sameContext: true,
    unchangedTurns: 1,
    intervalMs: 300000,
    now,
  });
  assert.ok(Date.parse(repeated.nextEligibleAt) > Date.parse(initial.nextEligibleAt));
  assert.equal(
    nextMotiveEligibility({ sameContext: false, unchangedTurns: 12, intervalMs: 300000, now })
      .unchangedTurns,
    0,
  );
  assert.ok(
    nextMotiveEligibility({ sameContext: true, unchangedTurns: 99, intervalMs: 86400000, now })
      .delayMs <=
      6 * 3600000,
  );
});
test('contact replay independently detects a changed inbox payload and refuses missing proof', () => {
  const snapshot = {
    policy: 'contact-v2' as const,
    candidate: { id: 'contact', conversationId: 'conversation', text: 'A grounded question' },
    quiet: false,
    pending: false,
    lastContactAt: null,
    intervalMs: 3600000,
    now,
    expiresAt: '2026-11-23T00:00:00Z',
  };
  const record = {
    snapshot,
    choice: { action: 'deliver', reason: 'local inbox permitted' },
    effect: { kind: 'local_inbox', conversationId: 'conversation', text: 'A grounded question' },
  };
  assert.equal(replayContact(record).state, 'matched');
  assert.equal(
    replayContact({ ...record, effect: { ...record.effect, text: 'Changed after recording' } })
      .state,
    'diverged',
  );
  assert.equal(
    replayContact({ ...record, snapshot: { ...snapshot, policy: undefined } }).state,
    'unsupported',
  );
});
test('offline continuity rejects queued work that could resurrect a cancelled goal', () => {
  const archive: ContinuityArchive = {
    goals: [{ id: 'goal', state: 'cancelled', version: 2 }],
    frames: [{ goal_id: 'goal', state: 'closed', parent_goal_id: null, continuation_depth: 1 }],
    transitions: [
      { goal_id: 'goal', version: 1, previous_state: null, state: 'active', ordinal: '1' },
      { goal_id: 'goal', version: 2, previous_state: 'active', state: 'cancelled', ordinal: '2' },
    ],
    actions: [],
  };
  assert.equal(replayContinuity(archive).state, 'matched');
  assert.equal(
    replayContinuity({
      ...archive,
      actions: [
        {
          id: 'action',
          goal_id: 'goal',
          goal_version: 1,
          kind: 'READ',
          state: 'queued',
          reviewed: false,
        },
      ],
    }).state,
    'diverged',
  );
  assert.equal(
    replayContinuity({ ...archive, frames: [{ ...archive.frames[0], state: 'foreground' }] }).state,
    'diverged',
  );
});
