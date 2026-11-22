# Cetana — coding and implementation design

**State:** design proposal, not implemented or runtime-verified. Behavioral authority is [digital model](02-digital-model.md), grounded in the [Myanmar research document](01-buddhist-explanation.md). This document owns code boundaries, data contracts, consistency, delivery order and acceptance mapping. It does not authorize running code, migrations or tests.

## Current source baseline

The ownership correction was committed in `ac103b3`. Its source has not been verified through application execution.

| Existing source                                                                 | Actual responsibility                                                                      | Treatment                                                                       |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `src/modules/vaca/interpret.ts`                                                 | Sufficient communication routines and explicit instruction recognition                     | Keep parsing separate from intention formation                                  |
| `src/modules/sikkha/proposal.ts`                                                | Proposal constraints, provenance references, criterion and action checks                   | Keep independent validation; do not call it cetana                              |
| `src/infra/ollama/cognition.ts`                                                 | Configured provider request, scoped schema and returned proposal                           | Extend with candidate-intention data after the contract is finalized            |
| `src/modules/manasikara/attend.ts`                                              | Explicit current object and source orientation                                             | Consume its object binding; do not replace it with a purpose string             |
| `src/modules/vithi/cycle.ts`                                                    | Serialized adoption, persisted decisions, goals, focus, action queue and feedback handling | Integrate intention coordination at the adoption boundary                       |
| `src/modules/vithi/replay.ts`                                                   | Replay against recorded context and pinned policies                                        | Add deterministic intention reconstruction and version support                  |
| `src/modules/cetana/cetana-service.ts` and `src/infra/postgres/recall-cycle.ts` | Older boolean READ/WAIT prototype path                                                     | Replace or retire together after checking all callers; preserve historical data |

`cetana/consider.ts` was removed by relocating its useful routines and checks. There is no completed intention-formation mechanism hidden behind that removal. Historical snapshots must remain readable and must not be rewritten with invented intentions.

## Proposed module API

Add `src/modules/cetana/intend.ts` as a pure coordinator and put shared wire contracts in `src/contracts/runtime.ts`. Avoid introducing a second workflow, repository owner or independent mind loop.

The proposed boundary is `formIntention(context, validatedCandidate, assessment)`. It returns a versioned adopted-intention record or an explicit reconsideration result. It neither invokes a model nor writes SQL, performs abilities or changes permissions. Relevant consequence uncertainty can lead to observation/clarification rather than blind adoption.

Use a separate candidate representation rather than renaming the existing `Decision`. The provider can suggest purpose, alternatives and expected consequences. The coordinator checks their references and internal consistency against authoritative context. These checks do not prove the semantic truth of the provider's assessment; behavioral acceptance remains necessary.

## Proposed record contract

The following fields describe a new versioned contract; they are not existing database columns or a ready migration.

| Field                        | Meaning and constraints                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `policy`                     | Explicit intention-policy version; replay must not silently apply newer semantics                                         |
| `objectId`                   | Exact current attended object ID                                                                                          |
| `goalId`, optional `focusId` | Retained concern links; conversation is communication context, not identity                                               |
| `basis`                      | `routine` or `cognition`, with the actual routine ID or inference action ID                                               |
| `purpose`                    | Bounded intended purpose, distinct from the action verb; unknown detail cannot be filled with invented text               |
| `direction`                  | Existing supported action plus its validated argument; effect remains unexecuted                                          |
| `motiveRefs`                 | Only attributable supplied motive/source references; empty means unknown or unnecessary, not no human-like motive exists  |
| `evidenceIds`                | References to retained valid evidence, keeping configured/reported/observed/inferred distinctions                         |
| `expectedConsequences`       | Bounded predictions, affected resources/parties when material, uncertainty and basis; never recorded as observed results  |
| `alternatives`               | Relevant considered candidates and rejection/defer reasons when genuinely supplied; no compulsory fabricated alternatives |
| `reviewConditions`           | Concrete evidence, control, source-change or outcome conditions requiring reconsideration                                 |
| `supersedesDecisionId`       | Optional link to the prior adopted direction being revised, not a rewritten historical record                             |

Decision ID, agent ID, sequence, goal/focus versions, generation and control version come from the authoritative transactional envelope. A candidate cannot set them. Do not duplicate current mutable goal state into a second authoritative intention table.

An ordinary routine should use a named, bounded purpose such as acknowledging the operator. It must identify its routine basis. A provider candidate carries uncertain semantic content; it cannot invent a valid routine identifier to gain a simpler path. No fabricated motivation trace or private chain-of-thought transcript is required.

## Adoption and persistence

1. Vithi selects work and retrieves valid scoped context. Establish the current attended object before requesting or forming any candidate.
2. Vaca supplies a sufficient routine candidate, or the provider supplies a cognition candidate. Keep this separate from the adopted intention and from observed effects.
3. Sikkha validates structural references and the relevant action constraints. Cetana coordinates the candidate with the object, concern and available consequence assessment. Failures produce an explicit rejection/reconsideration outcome without action dispatch.
4. Under the existing agent transaction/lock, recheck goal/focus/source versions, generation and control. Persist the decision snapshot, intention and any corresponding transition atomically. A deterministic operation key must prevent duplicate adoption on retries.
5. For an external operation, retain a decision-to-action reference in the same transaction that enqueues the operation. Authorization at adoption does not replace authorization/fencing at dispatch.
6. Actual operation feedback links through action ID to the adopting decision. Paccavekkhana reviews it against the retained purpose and criterion. A next intention references the review and superseded decision when appropriate.

Begin by storing the versioned intention in the existing decision JSON/snapshot envelope. Before implementing step 5, inspect physical schema constraints and add an additive decision/action linkage migration only if the existing linkage is insufficient. Final DDL, backfill policy and indexes belong to that implementation slice; do not edit applied migrations or fabricate intention records for legacy rows.

PostgreSQL remains domain truth; Temporal remains orchestration. Preserve the existing outbox, idempotent operation keys, agent ownership, transaction locks and late-result fences. An external effect cannot be made exactly-once by a database intention record.

## Provider and routine integration

Extend the provider schema and prompt with candidate purpose/consequence fields only when corresponding runtime adoption checks are implemented. Bump schema/prompt versions together; bound the candidate payload and keep secrets out of context. A provider response remains untrusted data. Do not accept a purpose string as evidence that a scope check succeeded.

Adapt sufficient local routines to return typed routine candidates. Preserve greetings, identity, explicit notes, reminders and command behavior. Avoid calling the model merely to fill fields that have an honest routine basis. Internal reflection uses the same adoption boundary as operator-driven consideration, with existing internal-action eligibility and contact controls.

Unknown/invalid candidate fields must not silently become a successful intention. A recoverable source change should trigger bounded reconsideration against current context. Repeated provider invalidity should produce an honest blockage using existing budgets, not an unbounded retry loop.

## Interruption, feedback and learning integration

Keep a commitment's criterion stable while individual intentions change. An interruption retains the displaced focus and a return condition. On return, reconsider under current evidence and permissions; do not replay obsolete input actions. Unknown effects block dispatch until reconciled.

Record predicted versus actual consequences without overwriting either. Paccavekkhana may propose a sourced memory update for later retrieval. Durable inclination changes need a separately versioned and scoped update contract with attribution and reversal. They are not implemented by copying a reflection into motives. Do not add autonomous policy/identity mutation, model training or executable self-upgrades in this slice.

## API and portal behavior

Return committed intention summaries with existing decision/activity detail: purpose, selected direction, basis, material uncertainty and linked observed outcome. Keep the default activity list compact and paginated; place the richer record in the detail view. Separate the current operation, retained concern and historical intention. Historical rows without this contract say no intention detail was recorded; do not synthesize one from text.

Portal steps must distinguish proposal received, direction adopted, operation queued, actual feedback returned and consequence reviewed. Do not label a generated purpose as verified reasoning or mark a task complete merely because an intention was recorded.

## Delivery slices and acceptance gates

| Slice | Source work                                                                                  | Required acceptance before completion                                                          |
| ----- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| CE-A  | Finalize record contract, pure coordinator, routine candidates and provider candidate schema | CE-01–CE-05; CE-C01/C03/C08/C09/C11, including wrong-object and fabricated-reference rejection |
| CE-B  | Atomic adoption, action linkage, idempotency, replay and historical compatibility            | CE-06/CE-07/CE-09; CE-C02/C05/C06/C10, including duplicate delivery and stale generation       |
| CE-C  | Review linkage, prediction/outcome discrepancy and scoped retained learning                  | CE-03/CE-08; CE-C07/C12, with actual changed future behavior and attributable memory           |
| CE-D  | Activity/detail integration and full scenario review                                         | CE-10 and all scenarios through the actual provider/runtime/portal boundaries                  |

When execution is explicitly authorized, verify focused pure logic first, isolated persistence/recovery next, then actual provider and human-style portal scenarios. Include paraphrases and contradictory feedback; do not use successful JSON parsing or one golden response as the semantic oracle. Preserve still-valid historical verification evidence while distinguishing it from new results.

## Completion boundary

Documentation is prepared; CE-A through CE-D are pending implementation and verification. Missing adjacent module contracts remain explicit dependencies. No application code, migration, dependency or service setting is changed by this documentation task. The next implementation task should begin with CE-A only after reviewing this contract, rather than redesigning several modules at once.
