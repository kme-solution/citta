# Adhimokkha (အဓိမောက္ခ) — coding and implementation design

**State:** documentation and read-only source assessment; proposed changes are not implemented by this file. Behavioral authority is the [digital model](02-digital-model.md); research belongs to the [Myanmar explanation](01-buddhist-explanation.md). Application execution requires the existing explicit-authorization gate.

## Current code and gap

A provider selects an action and goalReview status; proposal validation checks references and shape. There is no explicit distinction between supported provisional resolution and confident unsupported selection.

## Proposed record and interfaces

Propose ResolutionFacet with object/inquiry reference, state (provisional/needs-evidence/unresolved), candidate direction, supportRefs, unresolved premises and review conditions. Keep authority/versions in the common runtime envelope. A pure `adhimokkha/` contract function checks consistency; it must not convert a numeric confidence threshold into universal truth.

## Integration and state transitions

Vicara and panna supply examination/support assessment; resolution indicates the bounded choice available; cetana coordinates purpose/direction under that uncertainty. Vithi commits after current reference checks. Changed premises create a new linked resolution rather than mutating the old one.

## Failure, recovery and compatibility

If an important cited source was omitted or invalidated, retain needs-evidence and reconsider. Wrong-object or unsupported met status cannot pass merely because resolution says provisional. Historical decisions without this facet stay as originally recorded.

## Delivery slices and verification gates

1. Define action-relative resolution states and source requirements.
2. Integrate resolution as a shared consideration facet before cetana adoption.
3. Verify unsupported certainty, premise changes and separate permission/effect states.

Acceptance is defined by AD-01 onward and the AD-C scenarios in document 02. When execution is authorized, start with meaningful focused checks, then isolated persistence/integration checks where needed, then actual provider/portal observation for semantic behavior. Catalog-only checks should inspect authoritative data and representative classifications. Never claim a runtime outcome from this source review.

No application source, dependency, migration or running service is changed by this documentation. Keep historical records, private configuration and applied migration checksums intact. Proposed API/schema changes require explicit compatibility and version handling in their implementation slice. Actual completion, limitations and the next safe task remain in the existing delivery status document.
