# Dvara (ဒွါရ) — coding and implementation design

**State:** documentation and read-only source assessment; proposed changes are not implemented by this file. Behavioral authority is the [digital model](02-digital-model.md); research belongs to the [Myanmar explanation](01-buddhist-explanation.md). Application execution requires the existing explicit-authorization gate.

## Current code and gap

`dvara-service.ts` supplies a six-door constant and small legacy Observation interface. Current durable ingress is `ingest` in `src/infra/postgres/runtime-repository.ts`; result observations and internal cues are created in `vithi/cycle.ts`. Therefore the current dvara folder does not own the full ingestion path.

## Proposed record and interfaces

Extract a pure ingress contract under dvara and leave SQL in an adapter. Preserve existing observation IDs, source keys, request hashes and agent/conversation constraints. A proposed InputEnvelope includes channel, sourceKind, sourceKey, payload/mediaRef, receivedAt, reply target and correction target; timestamps and ownership are assigned by the runtime, not a provider.

## Integration and state transitions

Server validates transport size/origin; dvara validates the envelope; the repository transaction persists observation/message receipt and outbox wakeup together. Internal cues and actual ability results use separately typed constructors. Vithi consumes the observation once under its existing lock; phassa may bind available content without re-ingesting it.

## Failure, recovery and compatibility

Keep current retry/conflict semantics and source-key uniqueness. A missing/expired media reference is unavailable input, not an empty observed screen. Preserve legacy door labels as reference metadata; do not rewrite historical observations. Late results keep their original action/generation and cannot revive cancelled work.

## Delivery slices and verification gates

1. Specify typed operator/result/internal constructors and map existing ingress callers.
2. Extract domain validation without changing transaction ownership or receipt semantics.
3. Verify duplicate delivery, cross-agent reply rejection, media absence and correction timing when execution is authorized.

Acceptance is defined by DV-01 onward and the DV-C scenarios in document 02. When execution is authorized, start with meaningful focused checks, then isolated persistence/integration checks where needed, then actual provider/portal observation for semantic behavior. Catalog-only checks should inspect authoritative data and representative classifications. Never claim a runtime outcome from this source review.

No application source, dependency, migration or running service is changed by this documentation. Keep historical records, private configuration and applied migration checksums intact. Proposed API/schema changes require explicit compatibility and version handling in their implementation slice. Actual completion, limitations and the next safe task remain in the existing delivery status document.
