# Vedana (ဝေဒနာ) — coding and implementation design

**State:** documentation and read-only source assessment; proposed changes are not implemented by this file. Behavioral authority is the [digital model](02-digital-model.md); research belongs to the [Myanmar explanation](01-buddhist-explanation.md). Application execution requires the existing explicit-authorization gate.

## Current code and gap

`vedana/appraise.ts` copies proposed tone, reason, uncertainty and tendencies, with a disabled-mode override. It does not independently derive feeling from contact. `cetasika/vedana-service.ts` maps demo success to pleasant/neutral and is not the continuing appraisal mechanism.

## Proposed record and interfaces

Keep a versioned ModeledAppraisal record with decision/object IDs, proposed tone, source basis, uncertainty, candidate tendency and regulated choice. Keep the disabled flag and engineering-undetermined label explicit. The tone record must not become authority/evidence for factual claims or a reward that overwrites goals.

## Integration and state transitions

Appraise after a candidate has a grounded object and before persisting its associated decision facets. Cetana considers relevant modeled reactions without delegating authority to them. Paccavekkhana can supply outcome feedback for a later appraisal. Portal shows modeled status and cause, not "Kyaw2 truly suffers".

## Failure, recovery and compatibility

If provider tone is absent or invalid, preserve uncertainty rather than infer sentiment from HTTP status. Disabled mode cannot retain a hidden active affect score. Historical demo feedback stays identified as demo. No migration should rewrite old tones into claimed contact-level feeling.

## Delivery slices and verification gates

1. Define appraisal versus reaction fields and actual source provenance.
2. Replace success-tone demo coupling only with its legacy callers; keep runtime controls intact.
3. Verify criticism/praise, absent causes and disabled behavior using semantic scenarios and actual decisions.

Acceptance is defined by VE-01 onward and the VE-C scenarios in document 02. When execution is authorized, start with meaningful focused checks, then isolated persistence/integration checks where needed, then actual provider/portal observation for semantic behavior. Catalog-only checks should inspect authoritative data and representative classifications. Never claim a runtime outcome from this source review.

No application source, dependency, migration or running service is changed by this documentation. Keep historical records, private configuration and applied migration checksums intact. Proposed API/schema changes require explicit compatibility and version handling in their implementation slice. Actual completion, limitations and the next safe task remain in the existing delivery status document.
