# Citta-vithi (စိတ္တဝီထိ) — reference simulator — coding and implementation design

**State:** documentation and read-only source assessment; proposed changes are not implemented by this file. Behavioral authority is the [digital model](02-digital-model.md); research belongs to the [Myanmar explanation](01-buddhist-explanation.md). Application execution requires the existing explicit-authorization gate.

## Current code and gap

`citta-vithi-service.ts` hardcodes one eye-door sequence, selected type IDs and neutral feeling. `dvara-vithi-service.ts` generates door/grade patterns, including seven javana and optional registration. It shares dvara constants and cetasika/khandha reference helpers. These are selected examples, not a complete process theory.

## Proposed record and interfaces

Define ReferenceProcess with door, grade, assumptions, source/rule version and phase rows referencing stable type/function IDs where supported. A generic door/grade sequence may lack exact type assignments; preserve that distinction instead of guessing. Keep reference-only outputs outside decision/action tables.

## Integration and state transitions

Catalog request validates door/grade; reviewed process rules generate rows; optional cetasika/khandha projections add explanations under the same assumptions. Portal/CLI render a simulation label. Application worker/workflow must never import this to choose real behavior.

## Failure, recovery and compatibility

Unknown doors, grades, phase IDs and unsupported type combinations fail clearly. Do not label simplified grade handling complete until reviewed against its exact source rule. Maintain legacy CLI reference commands through compatible adapters; no historical runtime backfill is needed.

## Delivery slices and verification gates

1. Enumerate reviewed example/grade coverage and explicit exceptions from chapter IV.
2. Separate shared reference-door types from live ingress contracts; retain CLI compatibility.
3. Verify phase/function mappings, unsupported combinations and no runtime dependency.

Acceptance is defined by CV-01 onward and the CV-C scenarios in document 02. When execution is authorized, start with meaningful focused checks, then isolated persistence/integration checks where needed, then actual provider/portal observation for semantic behavior. Catalog-only checks should inspect authoritative data and representative classifications. Never claim a runtime outcome from this source review.

No application source, dependency, migration or running service is changed by this documentation. Keep historical records, private configuration and applied migration checksums intact. Proposed API/schema changes require explicit compatibility and version handling in their implementation slice. Actual completion, limitations and the next safe task remain in the existing delivery status document.
