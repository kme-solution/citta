# Phassa (ဖဿ) — coding and implementation design

**State:** documentation and read-only source assessment; proposed changes are not implemented by this file. Behavioral authority is the [digital model](02-digital-model.md); research belongs to the [Myanmar explanation](01-buddhist-explanation.md). Application execution requires the existing explicit-authorization gate.

## Current code and gap

There is no `src/modules/phassa` implementation. Observation, evidence and computer-screen records partially supply the necessary lineage in runtime contracts and desktop infrastructure. Do not rename an observation to claim the missing mechanism exists.

## Proposed record and interfaces

Propose a pure bindEncounter(input, availableContent, capabilityState) result with encounter ID, input ID, actual modality, source IDs, availability, capturedAt/sourceVersion, session generation and unavailable reason. The result references real content rather than duplicating images or storing credentials. Persist in the existing decision context unless independent retrieval needs justify a table.

## Integration and state transitions

Dvara admits input; infrastructure resolves only permitted content; phassa produces an available/unavailable binding. Manasikara uses a valid binding for the primary object; sanna proposes interpretations of that content. Recheck current session/source validity before computer dispatch, independently of the earlier encounter.

## Failure, recovery and compatibility

Do not reuse a captured image from another session or generation as current. Unknown delivered input is an effect uncertainty, not a successful encounter outcome. Historical contexts without a binding stay readable and explicitly lack this detail. No backfill may invent sensations.

## Delivery slices and verification gates

1. Finalize availability/freshness contract against desktop and evidence records.
2. Add a pure binding module and integrate only actual admitted content.
3. Verify missing/expired content, session replacement and report/observation distinction across provider and dispatch boundaries.

Acceptance is defined by PH-01 onward and the PH-C scenarios in document 02. When execution is authorized, start with meaningful focused checks, then isolated persistence/integration checks where needed, then actual provider/portal observation for semantic behavior. Catalog-only checks should inspect authoritative data and representative classifications. Never claim a runtime outcome from this source review.

No application source, dependency, migration or running service is changed by this documentation. Keep historical records, private configuration and applied migration checksums intact. Proposed API/schema changes require explicit compatibility and version handling in their implementation slice. Actual completion, limitations and the next safe task remain in the existing delivery status document.
