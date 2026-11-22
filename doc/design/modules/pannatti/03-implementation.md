# Pannatti (ပညတ်) — coding and implementation design

**State:** documentation and read-only source assessment; proposed changes are not implemented by this file. Behavioral authority is the [digital model](02-digital-model.md); research belongs to the [Myanmar explanation](01-buddhist-explanation.md). Application execution requires the existing explicit-authorization gate.

## Current code and gap

There is no separate pannatti implementation. Profile labels live under nama, catalog labels in JSON/services, and entity/reply references in routines, provider context and repository records. A new module is justified only by a concrete shared reference contract, not a requirement to wrap every string.

## Proposed record and interfaces

Propose Designation with stable referent ID, label, language, namespace/scope, provenance and version. Resolve ambiguity as a result carrying candidates/uncertainty rather than silently picking. Reuse existing UUIDs/catalog IDs; avoid a new global entity table until actual cross-module lookup requirements justify one.

## Integration and state transitions

Sanna proposes referents from supplied content and designations; vaca chooses truthful names for communication; profile loading supplies configured self-labels; catalog uses pinned terminology records. Sati retains correction lineage. No designation update grants scope or changes ownership.

## Failure, recovery and compatibility

Ambiguous aliases require clarification or retained uncertainty. A corrected source name preserves its source ID/history. Unknown label language does not imply cognition supports that language. Compatibility aliases should be read-only and explicit during any namespace migration.

## Delivery slices and verification gates

1. Inventory actual shared naming/reference requirements before adding runtime abstraction.
2. Implement only scoped designation resolution and compatible profile/catalog adapters.
3. Verify collisions, localization, correction lineage and separation of name from evidence.

Acceptance is defined by PN-01 onward and the PN-C scenarios in document 02. When execution is authorized, start with meaningful focused checks, then isolated persistence/integration checks where needed, then actual provider/portal observation for semantic behavior. Catalog-only checks should inspect authoritative data and representative classifications. Never claim a runtime outcome from this source review.

No application source, dependency, migration or running service is changed by this documentation. Keep historical records, private configuration and applied migration checksums intact. Proposed API/schema changes require explicit compatibility and version handling in their implementation slice. Actual completion, limitations and the next safe task remain in the existing delivery status document.
