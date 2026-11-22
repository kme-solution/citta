# Sanna (သညာ) — coding and implementation design

**State:** documentation and read-only source assessment; proposed changes are not implemented by this file. Behavioral authority is the [digital model](02-digital-model.md); research belongs to the [Myanmar explanation](01-buddhist-explanation.md). Application execution requires the existing explicit-authorization gate.

## Current code and gap

No separate sanna module exists. Recognition is distributed between regular expressions in `vaca/interpret.ts`, configured-provider proposals and text in focus/context. `khandha-service.ts` contains a reference description, not a recognition engine.

## Proposed record and interfaces

Propose InterpretationCandidate with objectId, sourceIds, kind (entity/referent/feature/intent), proposed meaning, alternatives when material, uncertainty and source/version lineage. Structured IDs refer to existing records; semantic confidence remains optional and cannot authorize effects. Store selected interpretation in the decision snapshot, not as an observed memory by default.

## Integration and state transitions

Consume encounter/object context and relevant sourced memory. Vaca uses recognition for message referents; cetana coordinates a direction using the candidate meaning. Sikkha still validates exact operation targets. A correction invalidates dependent candidates and pending proposals before adoption.

## Failure, recovery and compatibility

If required source content is absent, return unavailable interpretation. Contradictory labels require preserved uncertainty and fresh observation/clarification. Replays use retained candidates rather than calling a live vision model. Existing heuristic responses remain named routines until replaced with equivalent behavior.

## Delivery slices and verification gates

1. Inventory recognition outputs and define candidate/reference types.
2. Separate recognition from command execution while preserving sufficient routines.
3. Verify ambiguity, correction, entity separation and grounded screen interpretation with actual supplied content.

Acceptance is defined by SA-01 onward and the SA-C scenarios in document 02. When execution is authorized, start with meaningful focused checks, then isolated persistence/integration checks where needed, then actual provider/portal observation for semantic behavior. Catalog-only checks should inspect authoritative data and representative classifications. Never claim a runtime outcome from this source review.

No application source, dependency, migration or running service is changed by this documentation. Keep historical records, private configuration and applied migration checksums intact. Proposed API/schema changes require explicit compatibility and version handling in their implementation slice. Actual completion, limitations and the next safe task remain in the existing delivery status document.
