# Vithi (ဝီထိ) — application runtime — coding and implementation design

**State:** documentation and read-only source assessment; proposed changes are not implemented by this file. Behavioral authority is the [digital model](02-digital-model.md); research belongs to the [Myanmar explanation](01-buddhist-explanation.md). Application execution requires the existing explicit-authorization gate.

## Current code and gap

`workflow.ts` runs the stable Temporal loop; `activities.ts` claims and executes work with heartbeat/cancellation. `cycle.ts` currently owns large amounts of SQL, context construction, internal cues, decisions, effects and review. Queue arbitration, contact policy, work budgets, milestones and replay helpers already have smaller files.

## Proposed record and interfaces

Keep existing agent/generation/control, observation, goal/focus, decision and action contracts with explicit policy versions. Extract typed domain ports for context retrieval, concern selection, intention adoption and outcome review. Do not add one workflow per mental factor or a second authoritative state machine in Temporal history.

## Integration and state transitions

Relay drains durable wakeup outbox to a stable workflow; cycle locks agent state, reconciles work and selects a ready opportunity; domain modules compute associated candidate facets; adoption transaction records decision and action. Workers execute outside that transaction; result observations reenter the same owner. Controls wake/revoke according to current versions.

## Failure, recovery and compatibility

Lost wakeups are repaired by bounded reconciliation; duplicates use stable keys. Separate workflow replay determinism from domain decision replay and source policy versions. Continue-as-new must retain generation and existing durable state. Schema/code extraction must preserve transaction boundaries and SQL lock order before shrinking cycle.ts.

## Delivery slices and verification gates

1. Map current cycle phases and transaction/lock boundaries before extraction.
2. Extract context, adoption and review application services without changing serialization.
3. Verify crash windows, controls, interruption/return, deduplication and both replay modes.

Acceptance is defined by VT-01 onward and the VT-C scenarios in document 02. When execution is authorized, start with meaningful focused checks, then isolated persistence/integration checks where needed, then actual provider/portal observation for semantic behavior. Catalog-only checks should inspect authoritative data and representative classifications. Never claim a runtime outcome from this source review.

No application source, dependency, migration or running service is changed by this documentation. Keep historical records, private configuration and applied migration checksums intact. Proposed API/schema changes require explicit compatibility and version handling in their implementation slice. Actual completion, limitations and the next safe task remain in the existing delivery status document.
