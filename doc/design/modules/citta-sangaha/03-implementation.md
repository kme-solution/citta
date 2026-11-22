# Citta-sangaha (စိတ္တသင်္ဂဟ) — coding and implementation design

**State:** documentation and read-only source assessment; proposed changes are not implemented by this file. Behavioral authority is the [digital model](02-digital-model.md); research belongs to the [Myanmar explanation](01-buddhist-explanation.md). Application execution requires the existing explicit-authorization gate.

## Current code and gap

`citta-sangaha-service.ts` synchronously reads `data/catalog/v1/citta-types.json`, filters shared/summary/detailed projections and computes group counts. Existing records carry labelMy and pending Myanmar review. Actual reference completeness requires source review, not counts alone.

## Proposed record and interfaces

Keep existing versioned JSON records and IDs. Add or reference source/review metadata via compatible catalog schema changes. Validate unique IDs, projections, parent links and group membership at a deliberate catalog validation boundary; no new database is required solely for read-only reference.

## Integration and state transitions

Catalog loader supplies summary/detailed views; cetasika and simulator use stable IDs. API/portal display source/projection/review information. An operator reading a type does not change runtime consideration or select that type as an agent state.

## Failure, recovery and compatibility

Invalid catalog data should fail explicitly rather than silently drop records or manufacture counts. Preserve historical IDs in exports/bookmarks. Pinned source changes need versioning and reviewed transformations; generated translations cannot silently clear pending review.

## Delivery slices and verification gates

1. Map current JSON schema and chapter-I provenance.
2. Add compatible source/review validation and clear projection semantics.
3. Verify representative type/group/projection cases, stable references and read-only portal behavior.

Acceptance is defined by CG-01 onward and the CG-C scenarios in document 02. When execution is authorized, start with meaningful focused checks, then isolated persistence/integration checks where needed, then actual provider/portal observation for semantic behavior. Catalog-only checks should inspect authoritative data and representative classifications. Never claim a runtime outcome from this source review.

No application source, dependency, migration or running service is changed by this documentation. Keep historical records, private configuration and applied migration checksums intact. Proposed API/schema changes require explicit compatibility and version handling in their implementation slice. Actual completion, limitations and the next safe task remain in the existing delivery status document.
