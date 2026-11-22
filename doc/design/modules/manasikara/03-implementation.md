# Manasikara — coding and implementation design

**State:** MA-A structural source is implemented_unverified; MA-B–MA-D are pending. Read the [digital model](02-digital-model.md) for behavior and the [Myanmar explanation](01-buddhist-explanation.md) for sources. This document does not authorize application execution.

## Existing implementation and ownership

The source correction in `ac103b3` moved engineering queue arbitration out of manasikara. These are current source facts, not runtime acceptance results.

| Source                                        | Responsibility                                                                                              |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `src/modules/vithi/select-opportunity.ts`     | Queue arbitration, fairness and deterministic tie-break; reads historical attention-v2 policy               |
| `src/modules/manasikara/attend.ts`            | Pure object orientation from retained context, with attributable source kind and references                 |
| `src/contracts/runtime.ts`                    | Object-attention, proposal binding and queue snapshot wire contracts                                        |
| `src/modules/vithi/cycle.ts`                  | Establish object when recording a decision or queuing work; retain feedback sources across continuation     |
| `src/modules/sati/context-selection.ts`       | Preserve bounded object context and prioritize its source while omitting queue metadata from provider input |
| `src/infra/ollama/cognition.ts`               | Prompt/schema v19/10 binds generated proposals to the supplied object                                       |
| `src/modules/sikkha/proposal.ts`              | Independent proposal object-ID constraint; not semantic proof                                               |
| `src/modules/vithi/replay.ts`                 | Reconstruct recorded queue choice and object orientation using retained context                             |
| `src/modules/paccavekkhana/activity-steps.ts` | Attribute queue choice to vithi and explicit orientation to manasikara                                      |

## Object record

The first implementation should use existing decision/action JSON snapshots rather than invent another authoritative store for the same data.

An object-attention record contains:

- A versioned engineering policy identifier.
- The primary object ID, administrative kind and a bounded descriptive excerpt.
- Source reference IDs and their existing configured/reported/observed/inferred status.
- The original task ID, current trigger observation and, when present, focus ID/version.
- The mode of orientation: receive, examine feedback, remember, continue a question, explore a starting interest or revisit a scheduled concern.
- A short derived reason stating why this object is present. It is not a hidden reasoning transcript.
- A feedback status when needed: returned, failed or effect unconfirmed. Receiving a screenshot does not itself establish a successful application action.

Source references must come from the retained input, owned memory or actual effect records. A source missing from selected context cannot be silently invented. A synopsis is explicitly an excerpt. Do not truncate the actual operator request or current criterion to manufacture a fit.

The object should remain stable across an INFER request and its returned proposal. A subsequent file/screen result can change the object; the transition records why. The original concern remains a distinct retained link. `continuationTask`, focus and selected evidence remain needed; the new object record must not replace them with one overloaded text string.

## Derivation and stable identity

`attendToObject(context)` returns `ObjectAttention` without SQL, clocks, model calls or effects. Its current precedence is reviewed operation feedback, retained ability source, eligible internal focus, then the retained input/scheduled cue. Administrative kinds and orientation names are engineering classifications, not perception or spiritual qualities.

A source object uses `source:<observation-id>`; a retained focus uses `focus:<focus-id>`. The record carries the task ID, trigger ID and optional focus version. The synopsis is bounded to 320 characters with an excerpt marker. It never replaces the full request or criterion. A focus ID can remain stable across several considerations; therefore it does not prove the semantic object stayed the same. Further semantic continuity must be established from actual content and lineage.

A missing required ability/focus source currently throws; source invalidation can select a different valid context. MA-B must verify that missing/invalid sources produce a recoverable, truthful result rather than aborting a transaction repeatedly. Do not claim this failure path is proven safe without execution evidence.

Reviewed feedback distinguishes returned, failed and unconfirmed effects. An observed failure record is evidence that the operation failed or became uncertain, not evidence of the requested effect. Adviser content remains reported. An inference result must remain a proposal about the input object; it cannot become an observed discovery merely because the model returned it.

## Context and adoption integration

Keep `objectAttention` in provider context while stripping queue-selection snapshots. Preserve actual source references through context clipping and omissions; record excerpt/omission metadata. If mandatory current material cannot fit, surface the genuine budget limitation instead of silently substituting a different object. Provider byte limits are engineering constraints, not doctrinal attention capacity.

Require `attentionObjectId` for new bound proposals. Validate it independently of provider schema; malformed or wrong-object proposals cannot dispatch effects. Also retain existing evidence, criterion, source/version, authorization and generation checks. An exact ID match cannot detect an irrelevant fluent answer; MA-B/MA-C must evaluate actual content, next behavior and evidence.

Before recording an adopted decision, reconstruct the orientation from authoritative retained context. Recheck invalidations from pending inference. A correction must not preserve a stale synopsis as current truth, even if its old object ID remains syntactically valid.

## Persistence, replay and recovery

Use existing JSON decision/action snapshots; no new authoritative SQL table is required for MA-A. Preserve PostgreSQL ownership, transactional decisions and the single vithi owner. Keep queue selection distinct from object orientation and inference queue provenance.

Historical snapshots with only `attention` continue to mean queue arbitration. Do not backfill object attention or rewrite old records. Pin policy versions; future derivation changes require a replay dispatch/version strategy rather than silently recomputing old records under new semantics. Verify missing sources, historical queue-only records, source corrections and altered focus versions explicitly.

An interrupted inquiry retains its goal/focus and next useful step while the new message becomes the current object. Feedback becomes a new object under the original criterion. Pause preserves continuation; Stop/cancellation and unknown-effect fences prevent prohibited continuation. No database or provider result can bypass those controls.

## Portal and diagnostics

Activity summaries distinguish vithi's work choice from manasikara's orientation. Show the bounded object description, source status, orientation and reason using actual snapshots. A historical record without an object must say it lacks that detail, not synthesize attention from the action text. Keep current operation, retained concern and last ten history records distinct; use existing detail views for source lineage.

## Remaining slices and acceptance mapping

- **MA-A — structural foundation:** current source relocation, record, provider binding, activity attribution and replay. Unverified; acceptance includes MA-01–MA-04/MA-11/MA-12 and MA-C12/MA-C16.
- **MA-B — behavioral continuity:** prove interruption/return, feedback transitions, corrections, free thought and deliberate detours through actual runtime. Covers MA-05–MA-10/MA-14 and scenarios MA-C01–MA-C10/MA-C13–MA-C15/MA-C17–MA-C18.
- **MA-C — consequence-oriented redirection:** specify and implement useful continuation versus unhelpful elaboration with cetana, sikkha and paccavekkhana. Covers MA-08/MA-09/MA-13 and MA-C10/MA-C11/MA-C17. Never add `wise=true` or a morality score.
- **MA-D — cross-module fidelity:** revisit shared object/facet boundaries after phassa/sanna/vedana/sati/chanda/identity contracts exist. Pali names and shared IDs do not certify their mechanisms.

When authorized, run focused derivation/reference checks, isolated persistence/replay/recovery checks, then real-provider/portal behavioral scenarios with paraphrases and contradictory feedback. No tests, builds, migration or restart were performed as part of this documentation task. The whole module remains PARTIAL until relevant behavioral gates have evidence.
