# Cetasika (စေတသိက်) — coding and implementation design

**State:** documentation and read-only source assessment; proposed changes are not implemented by this file. Behavioral authority is the [digital model](02-digital-model.md); research belongs to the [Myanmar explanation](01-buddhist-explanation.md). Application execution requires the existing explicit-authorization gate.

## Current code and gap

`sampayoga-service.ts` builds required/conditional/excluded factors from ID patterns and families; it uses 121-type catalog records and includes conditional restrictions. `vedana-service.ts` is a demo success-tone helper incorrectly sharing the reference namespace. These two responsibilities need separation.

## Proposed record and interfaces

Propose versioned FactorAssociationRule metadata with type IDs, required/conditional/excluded sets, joint-occurrence/mutual-exclusion constraints and source locators. Preserve pinned catalog IDs and current projection mappings. Prefer declarative reviewed rules over increasingly opaque ID regexes when rule complexity warrants it.

## Integration and state transitions

Load validated factor/type data; resolve the requested summary or detailed ID; apply reviewed rules; return associations plus assumptions/restrictions/provenance. Simulator consumes reference results. Live runtime must not use this response as a diagnosis or execution permission.

## Failure, recovery and compatibility

An invalid type or inconsistent rule yields explicit classification error, not an empty factor list. Catalog data updates need version/checksum handling and preservation of old reference IDs. Remove the demo appraisal helper only together with its legacy caller; no historical feelings are backfilled.

## Delivery slices and verification gates

1. Map association rules to chapter-II source sections and representative edge cases.
2. Separate demo affect from reference ownership; introduce explicit rule metadata.
3. Verify universal, conditional, exclusion and projection cases against reviewed source expectations.

Acceptance is defined by CS-01 onward and the CS-C scenarios in document 02. When execution is authorized, start with meaningful focused checks, then isolated persistence/integration checks where needed, then actual provider/portal observation for semantic behavior. Catalog-only checks should inspect authoritative data and representative classifications. Never claim a runtime outcome from this source review.

No application source, dependency, migration or running service is changed by this documentation. Keep historical records, private configuration and applied migration checksums intact. Proposed API/schema changes require explicit compatibility and version handling in their implementation slice. Actual completion, limitations and the next safe task remain in the existing delivery status document.
