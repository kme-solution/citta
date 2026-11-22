# Viriya (ဝီရိယ) — coding and implementation design

**State:** documentation and read-only source assessment; proposed changes are not implemented by this file. Behavioral authority is the [digital model](02-digital-model.md); research belongs to the [Myanmar explanation](01-buddhist-explanation.md). Application execution requires the existing explicit-authorization gate.

## Current code and gap

`work-budget.ts` accounts resource availability; chanda eligibility controls opportunities and focusReview suggests continuation/release. There is no explicit useful-effort assessment that distinguishes persistence from repeated unsupported output.

## Proposed record and interfaces

Propose EffortAssessment with concern/inquiry IDs, actual progress references, available next step, recommendation (continue/change-method/await-input/release), reason and review condition. It is a versioned engineering policy result, separate from actual token/work usage. Introduce `viriya/` only with a real eligibility/adoption consumer.

## Integration and state transitions

Consume retained inquiry progress and review outcomes; recommend a next condition to chanda/cetana under current controls. Vithi remains responsible for eligibility and budget enforcement. A released inquiry can leave other legitimate curiosity eligible; no manufactured filler is generated to display continuous thought.

## Failure, recovery and compatibility

Missing progress data means unknown, not measured stagnation. A fixed count of retries cannot diagnose a hindrance. Recovery respects existing source versions and unknown-effect blocks. Historical resource metrics remain facts about work, not retroactive effort-quality scores.

## Delivery slices and verification gates

1. Separate effort-quality input/output from existing accounting and timers.
2. Integrate assessment with actual review/focus continuation under one serialized owner.
3. Verify useful persistence, no-progress change, release and no hidden idle cutoff.

Acceptance is defined by VR-01 onward and the VR-C scenarios in document 02. When execution is authorized, start with meaningful focused checks, then isolated persistence/integration checks where needed, then actual provider/portal observation for semantic behavior. Catalog-only checks should inspect authoritative data and representative classifications. Never claim a runtime outcome from this source review.

No application source, dependency, migration or running service is changed by this documentation. Keep historical records, private configuration and applied migration checksums intact. Proposed API/schema changes require explicit compatibility and version handling in their implementation slice. Actual completion, limitations and the next safe task remain in the existing delivery status document.
