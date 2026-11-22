# Citta-vithi (စိတ္တဝီထိ) — reference simulator — digital model

**State:** researched design specification; this file does not certify implementation. Read [Myanmar explanation](01-buddhist-explanation.md) before this document and [implementation design](03-implementation.md) afterward. Actual delivery evidence belongs to [status](../../../delivery/status.md).

## Purpose and interpretation

Citta-vithi is an educational reference simulator of selected later-Theravada process patterns. Application vithi remains the continuing-agent scheduler. The simulator must show source assumptions and cannot drive live behavior by fixed doctrinal counts.

The source identifiers CV-S1 onward belong to document 01. The requirements below are original engineering choices informed by that research, not statements attributed to the Buddha. Source-layer and terminology limits in document 01 apply. No database field, model response or software timing establishes a literal mental factor.

## Behavioral requirements

### CV-01 — Explicit assumptions

Expose selected door, grade, chosen type assumptions and source layer. Fixed neutral feeling in an example is not a universal statement.

### CV-02 — Supported cases only

Return only reviewed door/grade/process combinations. Unimplemented exceptions remain unsupported rather than assigned a plausible default.

### CV-03 — Stable references

Link phases/functions to valid citta/factor IDs and source rule version.

### CV-04 — No runtime coupling

Simulation output cannot schedule actual inference counts, idle gaps, effects or agent appraisals.

### CV-05 — Inspectable limitations

Display what is illustrative, simplified or pending review; distinguish example sequence from measured observation.

## Cooperation and ownership

Dvara reference doors, citta-sangaha types, cetasika associations and khandha explanations support learning. Application vithi owns actual orchestration and must remain separate.

## Acceptance scenarios

| ID     | Situation and required outcome                                   |
| ------ | ---------------------------------------------------------------- |
| CV-C01 | Eye-door example displays selected assumptions and source.       |
| CV-C02 | Mind-door grade request uses only supported rules.               |
| CV-C03 | Unknown grade fails instead of falling back to a nearby one.     |
| CV-C04 | Neutral reference feeling does not change live appraisals.       |
| CV-C05 | Runtime remains independent of seven-javana reference count.     |
| CV-C06 | Exported sequence preserves source and stable function/type IDs. |

Evaluate the resulting records, next action, correction lineage and visible outcome using different contexts and paraphrases. Schema validity, a fixed sentence or a Pali folder name is insufficient. Where this is a catalog/reference boundary, evaluate source provenance and classification correctness instead of pretending it is live cognition.

## Completion boundary

All requirements remain acceptance obligations until supported by relevant evidence. Existing behavior is described in document 03 without being promoted to full doctrinal fidelity. Adjacent modules must honor their own contracts; this specification does not complete their mechanisms by association.
