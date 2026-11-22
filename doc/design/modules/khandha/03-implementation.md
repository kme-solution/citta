# Khandha (ခန္ဓာ) — coding and implementation design

**State:** documentation and read-only source assessment; proposed changes are not implemented by this file. Behavioral authority is the [digital model](02-digital-model.md); research belongs to the [Myanmar explanation](01-buddhist-explanation.md). Application execution requires the existing explicit-authorization gate.

## Current code and gap

`khandha-service.ts` returns fixed descriptions for a selected eye-door simulation; `citta-vithi-service.ts` consumes them. It is not a decomposition of the continuing agent state. Its static text should remain explicit reference content with source/assumption labels.

## Proposed record and interfaces

Use a versioned KhandhaReferenceView with simulation/context ID, source locator, assumptions and five explanatory fields. This is read-only reference data, not five mutable runtime stores. Preserve existing simulator output compatibility while introducing provenance metadata.

## Integration and state transitions

The catalog/simulator supplies a selected reference context; khandha projects explanatory content; the portal renders it as reference. Associated runtime data can be linked only as explicitly limited analogies, never converted to doctrinal facts or used for action authorization.

## Failure, recovery and compatibility

Unknown simulation/type IDs must not receive a plausible generic success projection. Mark unavailable classifications and pending terminology. Existing static explanations remain readable; revisions require source review and versioning rather than rewriting agent history.

## Delivery slices and verification gates

1. Document source/assumption metadata for the existing projection.
2. Replace hardcoded misleading descriptions with reviewed reference mappings only where necessary.
3. Verify representative simulation views, unknown contexts and separation from live runtime.

Acceptance is defined by KH-01 onward and the KH-C scenarios in document 02. When execution is authorized, start with meaningful focused checks, then isolated persistence/integration checks where needed, then actual provider/portal observation for semantic behavior. Catalog-only checks should inspect authoritative data and representative classifications. Never claim a runtime outcome from this source review.

No application source, dependency, migration or running service is changed by this documentation. Keep historical records, private configuration and applied migration checksums intact. Proposed API/schema changes require explicit compatibility and version handling in their implementation slice. Actual completion, limitations and the next safe task remain in the existing delivery status document.
