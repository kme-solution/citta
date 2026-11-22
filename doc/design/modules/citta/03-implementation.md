# Citta / vinnana (စိတ် / ဝိညာဏ်) — coding and implementation design

**State:** documentation and read-only source assessment; proposed changes are not implemented by this file. Behavioral authority is the [digital model](02-digital-model.md); research belongs to the [Myanmar explanation](01-buddhist-explanation.md). Application execution requires the existing explicit-authorization gate.

## Current code and gap

Context and Decision currently hold loosely associated fields in `src/contracts/runtime.ts`; vithi builds/persists them, manasikara binds the object and appraise records tone. There is no shared consideration contract that validates cross-facet object/source consistency. Citta-sangaha is a separate reference catalog.

## Proposed record and interfaces

Propose ConsiderationEnvelope with policyVersion, objectAttention, source/version references, goal/focus links and optional typed interpretation, inquiry, resolution, appraisal, discernment and effort facets. Runtime assigns IDs/generation/sequence at commit. A pure assembleConsideration validates common references; it never opens a workflow or invokes a provider. Prefer `citta/` for the contract/coordinator, not a separate vinnana service.

## Integration and state transitions

Domain candidates share authoritative context; assemble and validate once; independent sikkha checks still apply; vithi commits the adopted decision and retained snapshot atomically. Kamma receives only an authorized operation. Feedback becomes a new consideration under the same concern. Schema version dispatch preserves historical snapshots lacking facets.

## Failure, recovery and compatibility

Conflicting facet objects or stale versions require reconsideration, not silent merging. A cancelled generation cannot commit an assembled candidate. Historical records cannot be backfilled with invented facets. Bounded context must retain mandatory envelope/reference data without copying every memory.

## Delivery slices and verification gates

1. Introduce the consideration contract and exact compatibility/version plan in the shared runtime contracts.
2. Add a pure citta assembly module only with its vithi adoption integration, avoiding a disconnected helper.
3. Verify cross-facet lineage, atomic adoption, interruption and historical replay when execution is authorized.

Acceptance is defined by CI-01 onward and the CI-C scenarios in document 02. When execution is authorized, start with meaningful focused checks, then isolated persistence/integration checks where needed, then actual provider/portal observation for semantic behavior. Catalog-only checks should inspect authoritative data and representative classifications. Never claim a runtime outcome from this source review.

No application source, dependency, migration or running service is changed by this documentation. Keep historical records, private configuration and applied migration checksums intact. Proposed API/schema changes require explicit compatibility and version handling in their implementation slice. Actual completion, limitations and the next safe task remain in the existing delivery status document.
