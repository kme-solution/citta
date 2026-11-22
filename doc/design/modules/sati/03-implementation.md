# Sati (သတိ) — coding and implementation design

**State:** documentation and read-only source assessment; proposed changes are not implemented by this file. Behavioral authority is the [digital model](02-digital-model.md); research belongs to the [Myanmar explanation](01-buddhist-explanation.md). Application execution requires the existing explicit-authorization gate.

## Current code and gap

`sati-recall-service.ts` creates a legacy memory cue. `context-selection.ts` bounds inference context to 10,000 UTF-8 bytes and records omissions/excerpts. `preferences.ts` defines supported scoped settings. Durable memory queries/corrections are distributed across the repository and vithi; agent-wide conversation memory is not completed by these files.

## Proposed record and interfaces

Define a scoped MemoryRepository port with retain, retrieve and appendCorrection operations using actual source/version lineage. Keep selected-context metadata with omitted counts, policy version and byte accounting. A derived finding references its evidence and review; a preference is not a credential or unrestricted policy update. Preserve existing memory IDs and correction history.

## Integration and state transitions

Retrieve current valid sources for the attended object/concern; preserve known unfinished tasks even when descriptions are omitted. Supply bounded context to the provider. Before adoption, recheck relevant memory/source versions. Reviewed feedback may append sourced findings; provider text cannot save an observed fact by itself. Expose memory separately from current Mind and Activity.

## Failure, recovery and compatibility

Missing material is explicitly unavailable, not proof no memory exists. Oversized mandatory content fails without source substitution. Agent ownership applies to recall, correction and readback. A legacy conversation-only recall cannot be presented as full individual memory; use a compatible retrieval extension with regression gates.

## Delivery slices and verification gates

1. Specify repository ports and current query/correction ownership.
2. Implement agent-wide relevant retrieval and current-source checks while preserving scoped preferences.
3. Verify correction during inference, cross-conversation relevance, omission honesty and ownership boundaries.

Acceptance is defined by ST-01 onward and the ST-C scenarios in document 02. When execution is authorized, start with meaningful focused checks, then isolated persistence/integration checks where needed, then actual provider/portal observation for semantic behavior. Catalog-only checks should inspect authoritative data and representative classifications. Never claim a runtime outcome from this source review.

No application source, dependency, migration or running service is changed by this documentation. Keep historical records, private configuration and applied migration checksums intact. Proposed API/schema changes require explicit compatibility and version handling in their implementation slice. Actual completion, limitations and the next safe task remain in the existing delivery status document.
