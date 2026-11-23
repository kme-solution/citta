# Paccavekkhana (ပစ္စဝေက္ခဏာ) — coding and implementation design

**State:** documentation and read-only source assessment; proposed changes are not implemented by this file. Behavioral authority is the [digital model](02-digital-model.md); research belongs to the [Myanmar explanation](01-buddhist-explanation.md). Application execution requires the existing explicit-authorization gate.

## Current code and gap

`review.ts` normalizes outcomes into criterion/state/reason. COMPUTER remains unknown until screen review; adviser accuracy remains unverified. Other successful bounded operations default to met/completed, so callers must not equate this operation-level result with fulfillment of a broad task. `activity-steps.ts` reconstructs summaries from persisted records, not measured module spans.

## Proposed record and interfaces

Propose OutcomeReview with action/decision/object IDs, original criterion/version, operationStatus, criterionStatus, supporting/contradicting sources, prediction discrepancy, uncertainty and recommended next step. Keep operation success separate from task satisfaction in the schema. Store linked immutable reviews or versioned append-only snapshots; finalize indexes only after query requirements are known.

## Integration and state transitions

Kamma returns actual feedback; vithi records it once and establishes the feedback object. ReviewOutcome supplies operational normalization; semantic comparison uses criterion and relevant content. Cetana forms the next candidate direction; sikkha rechecks authority. Milestone speech summarizes committed outcomes and open uncertainty under existing contact pacing.

## Failure, recovery and compatibility

A late result cannot reopen cancelled work. A duplicate review must not append duplicate learning or milestones. If evidence is insufficient, retain unknown and a clear next condition. Keep old normalizer semantics readable during replay, with explicit version dispatch for new review policies.

## Delivery slices and verification gates

1. Separate operation normalization from criterion/consequence comparison.
2. Integrate intention/action/review lineage with idempotent durable recording.
3. Verify incomplete evidence, contradiction, unknown-effect recovery and meaningful milestone summaries.

Acceptance is defined by PA-01 onward and the PA-C scenarios in document 02. When execution is authorized, start with meaningful focused checks, then isolated persistence/integration checks where needed, then actual provider/portal observation for semantic behavior. Catalog-only checks should inspect authoritative data and representative classifications. Never claim a runtime outcome from this source review.

No application source, dependency, migration or running service is changed by this documentation. Keep historical records, private configuration and applied migration checksums intact. Proposed API/schema changes require explicit compatibility and version handling in their implementation slice. Actual completion, limitations and the next safe task remain in the existing delivery status document.

### Result-driven follow-up reporting

Retain qualified completed/blocked/waiting reports from conversation-linked internal reviews using actual source/effect feedback or substantive operator discussion and explicit focus review. Deduplicate by source task/version, report state and latest non-INFER outcome, not generated wording or timer ticks. Deliver eligible reports without the general social-contact interval; Quiet/Pause/Stop and supersession remain. Preserve source task/conversation linkage in an additive migration and distinguish recorded inference from verified findings. A bounded reflection alone is not automatically a milestone.
