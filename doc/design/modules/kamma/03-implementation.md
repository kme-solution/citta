# Kamma (ကံ) — coding and implementation design

**State:** documentation and read-only source assessment; proposed changes are not implemented by this file. Behavioral authority is the [digital model](02-digital-model.md); research belongs to the [Myanmar explanation](01-buddhist-explanation.md). Application execution requires the existing explicit-authorization gate.

## Current code and gap

`registry.ts` describes INFER, READ, COMPUTER and CONSULT_AI. `abilities.ts` dispatches them after authorization; activity claiming/heartbeats/finish live in vithi and Postgres. `kamma-service.ts` reads the lamp fixture and `quote-service.ts` supports a legacy demo. Computer use actually goes through desktop infrastructure, not a browser API magically supplied by the module name.

## Proposed record and interfaces

Keep Work/Outcome plus capability metadata, stable operation ID, claim token, generation and relevant source/session references. Normalize started/returned/failed/unknown separately from task criterion. Proposed linkage to adopted intention must reference the real decision, not a newly invented success record. Explicitly register any new terminal/file-writing ability before exposing it.

## Integration and state transitions

Vithi persists action/outbox; the worker claims under current versions; sikkha checks live scope; typed adapter performs bounded work; Postgres records outcome; result observation wakes vithi. Paccavekkhana compares actual feedback under the original criterion. Secrets stay within connection infrastructure, never in action text or public state.

## Failure, recovery and compatibility

Retain operation receipts for input uncertainty, abort signals and stale-token rejection. A crash after effect but before acknowledgement must become unknown/reconciliation rather than automatic redispatch. Demo fixtures remain explicitly selected by demo/test entry points. Applied migrations and existing action history remain intact.

## Delivery slices and verification gates

1. Clarify executor/adapter contracts and isolate legacy fixture abilities.
2. Add decision/action lineage and normalized receipt/error metadata where missing.
3. Verify actual integrations, cancellation, uncertain crash windows and no silent provider fallback when authorized.

Acceptance is defined by KA-01 onward and the KA-C scenarios in document 02. When execution is authorized, start with meaningful focused checks, then isolated persistence/integration checks where needed, then actual provider/portal observation for semantic behavior. Catalog-only checks should inspect authoritative data and representative classifications. Never claim a runtime outcome from this source review.

No application source, dependency, migration or running service is changed by this documentation. Keep historical records, private configuration and applied migration checksums intact. Proposed API/schema changes require explicit compatibility and version handling in their implementation slice. Actual completion, limitations and the next safe task remain in the existing delivery status document.
