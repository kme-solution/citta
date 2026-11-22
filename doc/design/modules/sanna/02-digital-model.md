# Sanna (သညာ) — digital model

**State:** researched design specification; this file does not certify implementation. Read [Myanmar explanation](01-buddhist-explanation.md) before this document and [implementation design](03-implementation.md) afterward. Actual delivery evidence belongs to [status](../../../delivery/status.md).

## Purpose and interpretation

Sanna will own attributable recognition and interpretation candidates concerning supplied content. It distinguishes raw input from a proposed meaning and supports correction without converting a confident label into an observed fact.

The source identifiers SA-S1 onward belong to document 01. The requirements below are original engineering choices informed by that research, not statements attributed to the Buddha. Source-layer and terminology limits in document 01 apply. No database field, model response or software timing establishes a literal mental factor.

## Behavioral requirements

### SA-01 — Grounded interpretation

Every recognized entity, referent or feature links to supplied content or an explicit inference. Unknown references remain unknown.

### SA-02 — Alternative meanings

Retain materially different interpretations when ambiguity changes the action. Ask a focused question instead of guessing a destructive target.

### SA-03 — Correction and versioning

A corrected name or interpretation supersedes the derived claim, preserving the original input and prior interpretation lineage.

### SA-04 — No confidence laundering

Provider confidence cannot promote an interpretation into observed evidence. Distinguish image pixels, OCR/description candidates and verified application outcomes.

### SA-05 — Scoped recognition

Resolve quoted replies, current concern and agent identity using valid context; a shared name cannot merge different entities automatically.

## Cooperation and ownership

Phassa supplies available content; manasikara supplies the object; sati supplies prior records; pannatti supplies labels; sanna interprets; cetana decides direction. None of these alone guarantees truth.

## Acceptance scenarios

| ID     | Situation and required outcome                                                             |
| ------ | ------------------------------------------------------------------------------------------ |
| SA-C01 | "Do that" has two possible tasks: ask which one.                                           |
| SA-C02 | A quoted reply identifies the waiting question: continue that concern.                     |
| SA-C03 | A screenshot label is uncertain: observe or clarify before clicking.                       |
| SA-C04 | Operator corrects a company name: preserve both claim versions.                            |
| SA-C05 | Agent and operator share a name: keep their identities distinct.                           |
| SA-C06 | A vision model invents a button absent from supplied content: no authorized click follows. |

Evaluate the resulting records, next action, correction lineage and visible outcome using different contexts and paraphrases. Schema validity, a fixed sentence or a Pali folder name is insufficient. Where this is a catalog/reference boundary, evaluate source provenance and classification correctness instead of pretending it is live cognition.

## Completion boundary

All requirements remain acceptance obligations until supported by relevant evidence. Existing behavior is described in document 03 without being promoted to full doctrinal fidelity. Adjacent modules must honor their own contracts; this specification does not complete their mechanisms by association.
