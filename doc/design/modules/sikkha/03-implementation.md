# Sikkha (သိက္ခာ) — coding and implementation design

**State:** documentation and read-only source assessment; proposed changes are not implemented by this file. Behavioral authority is the [digital model](02-digital-model.md); research belongs to the [Myanmar explanation](01-buddhist-explanation.md). Application execution requires the existing explicit-authorization gate.

## Current code and gap

`authorize.ts` gates READ, COMPUTER and adviser scope and resolves permitted files. `proposal.ts` validates object/evidence/goal references and action conditions. Additional controls live in vithi, SQL claim logic, API origin validation and desktop OS sessions. There is no single proven complete policy surface.

## Proposed record and interfaces

Define ConstraintAssessment with action kind/target, policy version, allowed/denied/needs-evidence result, reasons and checked authoritative versions. Do not store secrets or model-controlled permissions. Keep pure reference checks separate from async filesystem/OS checks; the latter remain necessary immediately around effect execution.

## Integration and state transitions

The API validates transport/origin; proposal checks bind object and scope; cetana coordinates a direction; transactional adoption rechecks versions; action claim/execute rechecks current controls and real capability. The same policy identifiers should trace these boundaries without claiming an earlier allow guarantees a later allow.

## Failure, recovery and compatibility

Filesystem symlink changes, expired screens, Stop, generation change and unavailable OS consent can revoke an earlier opportunity. Preserve no-blind-retry rules after uncertainty. OS screen/input permission is separate from root access; never bypass consent by describing it as model authorization.

## Delivery slices and verification gates

1. Inventory all policy entry points and distinguish pure checks from live authority checks.
2. Introduce shared explicit policy results without weakening claim-time/OS enforcement.
3. Verify stale authorization, injection content, path races, ownership and control timing across boundaries.

Acceptance is defined by SI-01 onward and the SI-C scenarios in document 02. When execution is authorized, start with meaningful focused checks, then isolated persistence/integration checks where needed, then actual provider/portal observation for semantic behavior. Catalog-only checks should inspect authoritative data and representative classifications. Never claim a runtime outcome from this source review.

No application source, dependency, migration or running service is changed by this documentation. Keep historical records, private configuration and applied migration checksums intact. Proposed API/schema changes require explicit compatibility and version handling in their implementation slice. Actual completion, limitations and the next safe task remain in the existing delivery status document.
