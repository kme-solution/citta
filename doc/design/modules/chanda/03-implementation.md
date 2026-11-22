# Chanda (ဆန္ဒ) — coding and implementation design

**State:** documentation and read-only source assessment; proposed changes are not implemented by this file. Behavioral authority is the [digital model](02-digital-model.md); research belongs to the [Myanmar explanation](01-buddhist-explanation.md). Application execution requires the existing explicit-authorization gate.

## Current code and gap

`chanda-service.ts` has a legacy recalls/3 curiosity threshold. `eligibility.ts` computes engineering delay/backoff; `focus.ts` owns SQL for continuing concern selection, advancement and validity. `vithi/cycle.ts` constructs internal cues and consults budgets. These are useful mechanisms but not a complete desire model.

## Proposed record and interfaces

Preserve existing motives, motive_contexts and focuses, but specify separate Interest, CandidateConcern and RetainedFocus contracts. Add versioned origin/reference metadata only where absent; do not reset records. Model a return condition and source validity explicitly. No desire score should be inferred from recall count alone.

## Integration and state transitions

Retrieve eligible interests and sources under one agent lock; vithi selects an opportunity; manasikara binds the object; cetana adopts a direction. Focus advancement records actual progress or justified status changes. Sati can supply new associations without promoting them to operator priorities. Proactive contact still passes its separate policy.

## Failure, recovery and compatibility

Invalidated source or cancelled source task prevents blind resumption. Unknown effects cannot become a new motive that bypasses blocked dispatch. Same-context repetition is a signal to review progress, not proof of learning. Keep current continuous-mode eligibility without adding an unapproved arbitrary idle cutoff.

## Delivery slices and verification gates

1. Separate legacy threshold demo, eligibility policy and retained-concern contracts.
2. Clarify provenance and deliberate return/release transitions without replacing agent memory.
3. Verify idle initiative, repeated-topic review, interruption and no-budget-bypass behavior through real context.

Acceptance is defined by CH-01 onward and the CH-C scenarios in document 02. When execution is authorized, start with meaningful focused checks, then isolated persistence/integration checks where needed, then actual provider/portal observation for semantic behavior. Catalog-only checks should inspect authoritative data and representative classifications. Never claim a runtime outcome from this source review.

No application source, dependency, migration or running service is changed by this documentation. Keep historical records, private configuration and applied migration checksums intact. Proposed API/schema changes require explicit compatibility and version handling in their implementation slice. Actual completion, limitations and the next safe task remain in the existing delivery status document.
