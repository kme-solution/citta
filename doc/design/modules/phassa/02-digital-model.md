# Phassa (ဖဿ) — digital model

**State:** researched design specification; this file does not certify implementation. Read [Myanmar explanation](01-buddhist-explanation.md) before this document and [implementation design](03-implementation.md) afterward. Actual delivery evidence belongs to [status](../../../delivery/status.md).

## Purpose and interpretation

Phassa is a deliberately limited engineering representation of an available encounter: which admitted source content and actual capability support the current consideration. It does not simulate consciousness or turn every network event into literal contact.

The source identifiers PH-S1 onward belong to document 01. The requirements below are original engineering choices informed by that research, not statements attributed to the Buddha. Source-layer and terminology limits in document 01 apply. No database field, model response or software timing establishes a literal mental factor.

## Behavioral requirements

### PH-01 — Available encounter

Bind admitted input to available content, modality and capability/session reference. A filename or URL without content cannot count as observed encounter.

### PH-02 — No fabricated completion

Failed capture, expired image and unavailable source remain unavailable. Distinguish operator report of a screen from actual screen feedback.

### PH-03 — Common object lineage

The encounter can support manasikara and modeled appraisal under one decision; it does not independently start another foreground stream.

### PH-04 — Temporal validity

Screen/session freshness and source versions constrain whether an encounter supports an intended action. Re-observe when material state changed.

### PH-05 — Reported versus observed

Adviser speech and recalled notes preserve source status even when their text is currently available.

## Cooperation and ownership

Dvara is ingress; infrastructure owns device capture; phassa is encounter lineage; manasikara is orientation; sanna is interpretation. These records are software facets, not sequentially co-arising Buddhist minds.

## Acceptance scenarios

| ID     | Situation and required outcome                                                    |
| ------ | --------------------------------------------------------------------------------- |
| PH-C01 | A URL is supplied but no page was opened: bind reported URL only.                 |
| PH-C02 | Screen permission is missing: unavailable encounter.                              |
| PH-C03 | A current screen is captured: reference the actual image and session.             |
| PH-C04 | An old frame precedes a changed page: require refreshed observation before input. |
| PH-C05 | A recalled claim remains reported, not freshly observed.                          |
| PH-C06 | A model describes an image that was not supplied: reject source support.          |

Evaluate the resulting records, next action, correction lineage and visible outcome using different contexts and paraphrases. Schema validity, a fixed sentence or a Pali folder name is insufficient. Where this is a catalog/reference boundary, evaluate source provenance and classification correctness instead of pretending it is live cognition.

## Completion boundary

All requirements remain acceptance obligations until supported by relevant evidence. Existing behavior is described in document 03 without being promoted to full doctrinal fidelity. Adjacent modules must honor their own contracts; this specification does not complete their mechanisms by association.
