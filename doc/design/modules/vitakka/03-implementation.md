# Vitakka (ဝိတက်) — coding and implementation design

**State:** documentation and read-only source assessment; proposed changes are not implemented by this file. Behavioral authority is the [digital model](02-digital-model.md); research belongs to the [Myanmar explanation](01-buddhist-explanation.md). Application execution requires the existing explicit-authorization gate.

## Current code and gap

Initial questions are implicit in ctx.text, focus topic/nextStep and provider prompt. `manasikara/attend.ts` identifies the object but does not specify the inquiry angle. No explicit vitakka contract exists.

## Proposed record and interfaces

Propose InquiryOpening with objectId, bounded question, optional tentative hypothesis, originRefs and concern link. Model/provider output is a candidate. Place an initial pure opening function in a shared `vitakka/` module if the interface is reused; it must not invoke a model itself or create an independent goal every turn.

## Integration and state transitions

After orientation and valid recognition, an applicable candidate establishes the question. Vicara examines it using available evidence; panna assesses the support and cetana coordinates a direction. Persist the opening as a facet of the common consideration envelope, with deliberate angle changes linked to prior inquiry.

## Failure, recovery and compatibility

An unsupported hypothesis never becomes observed memory. A missing source or unclear referent leads to clarification/uncertainty. Repeated rewording is not a fresh inquiry finding. Preserve old focus records without retroactively inventing their initial question.

## Delivery slices and verification gates

1. Specify inquiry-opening versus object/concern contracts and local-routine omission.
2. Integrate candidate inquiry opening with shared consideration and focus lineage.
3. Verify specificity, free curiosity, deliberate detours and no unsupported findings.

Acceptance is defined by VI-01 onward and the VI-C scenarios in document 02. When execution is authorized, start with meaningful focused checks, then isolated persistence/integration checks where needed, then actual provider/portal observation for semantic behavior. Catalog-only checks should inspect authoritative data and representative classifications. Never claim a runtime outcome from this source review.

No application source, dependency, migration or running service is changed by this documentation. Keep historical records, private configuration and applied migration checksums intact. Proposed API/schema changes require explicit compatibility and version handling in their implementation slice. Actual completion, limitations and the next safe task remain in the existing delivery status document.
