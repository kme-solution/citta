# Kamma (ကံ) — digital model

**State:** researched design specification; this file does not certify implementation. Read [Myanmar explanation](01-buddhist-explanation.md) before this document and [implementation design](03-implementation.md) afterward. Actual delivery evidence belongs to [status](../../../delivery/status.md).

## Purpose and interpretation

Kamma owns typed, authorized ability execution and truthful feedback in the software runtime. It includes computational work and outgoing effects as engineering actions, without claiming a Buddhist karmic ledger.

The source identifiers KA-S1 onward belong to document 01. The requirements below are original engineering choices informed by that research, not statements attributed to the Buddha. Source-layer and terminology limits in document 01 apply. No database field, model response or software timing establishes a literal mental factor.

## Behavioral requirements

### KA-01 — Typed ability

Execute only registered operations with validated arguments and scope. A provider sentence is not a new executable capability.

### KA-02 — Actual feedback

Return content/screens/error/uncertainty with operation identity. Delivered keyboard input does not prove the requested application state.

### KA-03 — Retry by effect class

Read-only reobservation differs from input that may already have happened. Unknown external effects block blind repetition.

### KA-04 — Cancellation limits

Abort what can be aborted, stop new dispatch and retain late feedback honestly. Do not claim already delivered input was undone.

### KA-05 — Separated providers

Configured cognition and optional adviser speech have distinct purposes and provenance. No silent provider fallback or personal Codex memory inheritance.

## Cooperation and ownership

Cetana supplies adopted direction; sikkha constrains; infrastructure performs real IO; kamma normalizes the ability; vithi owns durable dispatch; paccavekkhana judges the criterion. No operation adapter owns independent deliberation.

## Acceptance scenarios

| ID     | Situation and required outcome                                            |
| ------ | ------------------------------------------------------------------------- |
| KA-C01 | READ returns real UTF-8 content within root; invalid encoding fails.      |
| KA-C02 | COMPUTER types text: retain resulting screen, do not assume task success. |
| KA-C03 | Crash after input: mark uncertainty and reconcile.                        |
| KA-C04 | Cancelled adviser process returns late: no task revival.                  |
| KA-C05 | No browser permission: report actual limitation, not fake browsing.       |
| KA-C06 | A generated shell command has no registered ability: do not execute it.   |

Evaluate the resulting records, next action, correction lineage and visible outcome using different contexts and paraphrases. Schema validity, a fixed sentence or a Pali folder name is insufficient. Where this is a catalog/reference boundary, evaluate source provenance and classification correctness instead of pretending it is live cognition.

## Completion boundary

All requirements remain acceptance obligations until supported by relevant evidence. Existing behavior is described in document 03 without being promoted to full doctrinal fidelity. Adjacent modules must honor their own contracts; this specification does not complete their mechanisms by association.
