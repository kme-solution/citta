# Vicara (ဝိစာရ) — digital model

**State:** researched design specification; this file does not certify implementation. Read [Myanmar explanation](01-buddhist-explanation.md) before this document and [implementation design](03-implementation.md) afterward. Actual delivery evidence belongs to [status](../../../delivery/status.md).

## Purpose and interpretation

Represent a bounded examination of a supplied inquiry: what evidence supports or challenges candidate interpretations, what remains unknown and what next step would resolve it. This does not require exposing private chain of thought or running a fixed multi-step script for every response.

The source identifiers VC-S1 onward belong to document 01. The requirements below are original engineering choices informed by that research, not statements attributed to the Buddha. Source-layer and terminology limits in document 01 apply. No database field, model response or software timing establishes a literal mental factor.

## Behavioral requirements

### VC-01 — Evidence examination

Retain concise supporting and contradicting source references and the unresolved question; do not store invented internal reasoning transcripts.

### VC-02 — Progress distinction

Different wording, another model call or a changed object ID alone cannot establish progress. Identify new evidence, corrected interpretation or bounded conclusion.

### VC-03 — Bounded exploration

Examination may suggest a permitted observation, source read, necessary question or justified release. It cannot invoke abilities independently.

### VC-04 — Continuity

Preserve the same inquiry across relevant feedback unless a deliberate revision is recorded. A future step remains a proposal until adopted.

### VC-05 — No compulsory elaboration

Routine sufficient responses can omit the facet. Unknown evidence should stop a conclusion, not force endless generated analysis.

## Cooperation and ownership

Vicara examines; panna assesses evidential adequacy; paccavekkhana reviews actual outcomes; cetana chooses direction. Examination does not authorize effects or substitute for retained memory.

## Acceptance scenarios

| ID     | Situation and required outcome                                             |
| ------ | -------------------------------------------------------------------------- |
| VC-C01 | A second read adds contradicting evidence: revise the conclusion.          |
| VC-C02 | Three paraphrases add nothing: no progress claim.                          |
| VC-C03 | A required fact is unavailable: preserve uncertainty and a next condition. |
| VC-C04 | A proposed browser action waits for independent authorization.             |
| VC-C05 | Greeting omits examination.                                                |
| VC-C06 | Changed inquiry is recorded rather than silently rewritten.                |

Evaluate the resulting records, next action, correction lineage and visible outcome using different contexts and paraphrases. Schema validity, a fixed sentence or a Pali folder name is insufficient. Where this is a catalog/reference boundary, evaluate source provenance and classification correctness instead of pretending it is live cognition.

## Completion boundary

All requirements remain acceptance obligations until supported by relevant evidence. Existing behavior is described in document 03 without being promoted to full doctrinal fidelity. Adjacent modules must honor their own contracts; this specification does not complete their mechanisms by association.
