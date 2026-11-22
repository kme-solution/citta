# Vithi (ဝီထိ) — application runtime — digital model

**State:** researched design specification; this file does not certify implementation. Read [Myanmar explanation](01-buddhist-explanation.md) before this document and [implementation design](03-implementation.md) afterward. Actual delivery evidence belongs to [status](../../../delivery/status.md).

## Purpose and interpretation

Vithi owns one serialized foreground decision stream for the agent while asynchronous abilities run without owning deliberation. It is durable orchestration with interruption, controls, recovery and replay, not a literal Abhidhamma process.

The source identifiers VT-S1 onward belong to document 01. The requirements below are original engineering choices informed by that research, not statements attributed to the Buddha. Source-layer and terminology limits in document 01 apply. No database field, model response or software timing establishes a literal mental factor.

## Behavioral requirements

### VT-01 — Single owner

Only the serialized cycle adopts domain decisions. Provider callbacks and effect workers cannot create competing foreground minds.

### VT-02 — Responsive interruption

Admit operator input, yield eligible inference at safe boundaries, retain displaced work and recheck versions on resumption.

### VT-03 — Continuous initiative

Eligible internal consideration remains possible without pending work. Timer wakeups are opportunities, not manufactured thoughts or a doctrinal clock.

### VT-04 — Durable consistency

PostgreSQL owns domain truth; Temporal orchestrates keyed at-least-once delivery. Preserve outbox, transactional adoption and generation/control fences.

### VT-05 — Honest recovery

Late or duplicate results cannot revive terminal work. Unknown effects require reconciliation; replay never invokes a live provider or ability.

## Cooperation and ownership

Vithi schedules and persists; it must not become the owner of every domain meaning. Cetana, manasikara, sati, chanda and review compute bounded responsibilities under the same transaction/context.

## Acceptance scenarios

| ID     | Situation and required outcome                                         |
| ------ | ---------------------------------------------------------------------- |
| VT-C01 | Two wakeups arrive: one committed adoption per operation key.          |
| VT-C02 | Long inference runs while operator pauses: controls remain responsive. |
| VT-C03 | No incoming work: a genuine internal concern can be considered.        |
| VT-C04 | Worker crashes after effect: uncertainty survives restart.             |
| VT-C05 | Late result belongs to cancelled generation: retained but unapplied.   |
| VT-C06 | Replay has no network, model calls or effect dispatch.                 |

Evaluate the resulting records, next action, correction lineage and visible outcome using different contexts and paraphrases. Schema validity, a fixed sentence or a Pali folder name is insufficient. Where this is a catalog/reference boundary, evaluate source provenance and classification correctness instead of pretending it is live cognition.

## Completion boundary

All requirements remain acceptance obligations until supported by relevant evidence. Existing behavior is described in document 03 without being promoted to full doctrinal fidelity. Adjacent modules must honor their own contracts; this specification does not complete their mechanisms by association.
