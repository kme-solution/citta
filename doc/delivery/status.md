# Current status and next safe task

**Updated:** 2026-11-22. **Authority:** sole record of implementation progress, actual verification and unresolved decisions. The [development plan](plan.md) defines gates; the [approved architecture](../design/architecture.md) and [flows](../design/behavior-flows.md) define the target.

## Baseline and current position

- Kyaw accepted architecture A01-A07 and behavior F01-F20, S01-S42 and W01-W03 as the basis for development.
- Kyaw requested an explicit internal-initiative refinement on 2026-11-22: A08-A09, F21-F26, S43-S60 and W04-W06 add new topics/activity with no pending work, proactive local conversation and improvement proposals. This is a design extension, not implemented behavior.
- Kyaw accepted the stack on 2026-11-22: TypeScript/Node, Fastify, React/Vite, Temporal, PostgreSQL, conditional pgvector, Ollama local cognition, optional Codex advice, structured events/OpenTelemetry and Compose/systemd supervision. vLLM is a later scaling option. A10 records the deployment topology. Approved package dependencies are now installed; runtime source is being implemented without application execution.
- Documentation is reorganized around that baseline. Competing old milestone/folder/schema instructions and duplicate progress paragraphs are removed. Git history retains prior document revisions.
- The legacy prototype remains preserved. New continuing-runtime source is implemented but unverified; no P1-P6 acceptance gate is complete.
- The earlier documentation cleanup was separate from the current authorized implementation. Current source changes do not apply migrations, overwrite private configuration, run application checks or cut over services.

## Capability inventory

| Area | Current source/state | Remaining evidence |
|---|---|---|
| Catalog/simulation | Existing reference modules/data/commands preserved; new portal exposes English/Myanmar and 89/121 views | Doctrine/source and Myanmar terminology review; runtime portal acceptance |
| Profile | Validated private configuration and immutable PostgreSQL profile hashes | Setup/restart/unknown-field acceptance |
| Consideration | Sufficient local routines plus bounded Ollama proposals and independent policy checks | Real integrated English/Myanmar assessment; no automatic cloud fallback |
| Memory/history | Durable messages, scoped reported/observed/inferred memory, source lineage and correction/import tools | Migration/import, reload, pagination and correction integration |
| Continuity/control | Stable Temporal owner, durable queued actions/results, frames, pause/stop/quiet/cancel, versioned corrections, due recalls and explicit budget extensions | Interruption, fairness, stale-result and crash-window campaign |
| Internal initiative | Persistent configured/inferred interests, new topics without pending work, bounded local exploration/reflection and contact/proposal records | No-input, quiet/silence/decline, budget and restart evidence |
| Abilities | Real scoped file reads, actual local Ollama HTTP and optional cancellable Codex CLI | Actual failures, source/advice review, authorization and resource behavior |
| Affect | Contextual proposal tone, candidate/adopted tendency, alternatives and regulation summaries | Contrasting grounded scenarios; no human equivalence claimed |
| Recovery/replay | Explicit closed-workflow generation recovery, stored attempt/outcome handling, isolated domain/contact and Temporal replay source | Execute failure injection and replay comparisons |
| Portal/operations | React/Vite, Fastify/SSE, local supervisor, migration runner and local service templates | Type/build, isolated startup, browser desktop/mobile and service acceptance |

Presence of source code does not mean runtime or visual acceptance. The capability inventory is intentionally distinct from the target architecture.

## Phase status

| Phase | State | Next evidence needed |
|---|---|---|
| P0 executable contracts | In progress | DDL/API/control/consistency source specified; local model and integrated failure behavior remain unevaluated |
| P1 durable local cycle | Implemented, unverified | Migrations, real zero-adviser cycles, deduplication and durable readback |
| P2 continuity/control | Implemented, unverified | Interrupted work, fairness, corrections/cancellation, recovery and visible controls |
| P3 memory/affect/initiative | Implemented, unverified | English/Myanmar quality; contextual appraisal, no-pending-work topics and local contact/interest behavior |
| P4 evidence abilities | Implemented, unverified | Real source/path/evidence-first completion with zero adviser dispatches |
| P5 optional adviser | Implemented, unverified | Justified nonblocking CLI integration, advice review and uncertain/late results |
| P6 replay/acceptance | Replay source implemented; acceptance pending | Offline domain/contact/Temporal replay plus full S/W acceptance classification |

## Verification evidence and limits

| Date / scope | Evidence actually obtained | Limit |
|---|---|---|
| 2026-11-20 local preparation | Node 24.16.0, npm 11.13.0; dependency installation completed; audit reported zero vulnerabilities at that time | Not a current audit or version guarantee |
| 2026-11-20 database/prototype | Configured local database created; migrations 001/002 applied; PostgreSQL 16.15 accepted connections | No new-runtime schema or migration acceptance |
| 2026-11-20 prototype checks | Eye/catalog, auto-recall resolution/revisit, quote demo/trace and TypeScript check passed after union-access fix | Later source changes were not all rechecked; no general replay proof |
| 2026-11-20 portal/API | Assets, remember/recall with DB confirmation, duplicate retry, conversation isolation, text reading and request rejection checks passed | Predates identity/continuing-runtime work; browser UI not verified |
| 2026-11-20 Codex route | Explicit and plain-message HTTP smoke requests returned actual Codex replies; route assertions and TypeScript passed for that revision | Earlier direct/plain-message routing is superseded as the target; not evidence for current new-runtime behavior |
| Later portal startup | Portal restart returned HTTP 200; PostgreSQL accepted connections | No end-to-end identity, affect, continuity or visual acceptance |
| 2026-11-21 design artifacts | 20 behavior and seven architecture drawings rendered; PDF pages visually inspected | Document rendering only; Mermaid-specific renderer and gallery controls not tested |
| 2026-11-22 documentation cleanup | All 12 Markdown files passed local link/anchor and duplicate-heading checks; A01-A07, F01-F20, S01-S42 and W01-W03 were preserved; source/renderer/output hashes and whitespace checks passed; regenerated PDFs were visually reviewed | No application behavior is verified by these checks; Mermaid-specific rendering and gallery interaction remain unverified |

At the earlier documentation milestone, the initiative refinement was documentation-only. Its source is now implemented but remains unverified. On 2026-11-22, all 12 Markdown files passed link/anchor, duplicate-heading and stable-identifier checks for A01-A09, F01-F26, S01-S60 and W01-W06. Source/renderer/output hashes and whitespace checks passed. The refreshed 44-page behavior and 14-page architecture PDFs were rendered; new/changed drawings, metadata, scenarios and walkthroughs were visually inspected. None of this is application acceptance; Mermaid-specific rendering and gallery interaction remain unverified.

Stack-baseline verification (2026-11-22): all 12 Markdown files passed internal link/anchor, duplicate-heading and stable-identifier checks including A10. Source/renderer/output hashes and whitespace checks passed. The 44-page behavior and 17-page architecture PDFs were regenerated; changed topology, stack tables, replay/local-cognition and adviser-boundary pages were visually inspected. No application code, dependencies, database or services changed.

Local test data was retained: resolved lamp, a quote demo run and one synthetic portal note. No cleanup/deletion of database data is authorized by this document reorganization.

## Open decisions

| ID | Choice / risk | Required resolution and gate |
|---|---|---|
| DEC-01 | Actual local model and hardware | Ollama local cognition is agreed; P0 evaluates candidate models on English/Myanmar tasks, schema/semantic validity, uncertainty, latency and hardware. No automatic external fallback. Broader human equivalence is not implied. |
| DEC-02 | Temporal/PostgreSQL boundary and schema | P0 defines exact workflow/activity ownership, domain versions, outbox/deduplication, dual-write reconciliation, SQL/state constraints and migration order; preserve existing data. |
| DEC-03 | Interruption/control endpoints and stream cursors | P0 specifies stop scope, input deduplication, reconnect/readback and goal-version checks before P2 integration. |
| DEC-04 | External adapter lifecycle | Define safe cancellation, in-flight ownership, token fencing and unknown-outcome reconciliation before enabling live advice in P5. |
| DEC-05 | Contextual appraisal rules and tunables | P0 identifies bounded supported cases; P3 validates their cause/effect and contrasting scenarios. Contracts' numeric limits are proposed, not measured or doctrinal. |
| DEC-07 | Internal initiative policy | P0 defines motive/topic records, bounded fresh-topic generation, global work and contact budgets, availability and proposal lifecycle; P3 demonstrates behavior without incoming messages or pending work. No self-granted execution rights. |
| DEC-08 | Local supervision and retrieval activation | Choose Compose or systemd at P0; activate pgvector after scoped retrieval evaluation. vLLM is an optional measured scaling path, not an initial dependency. |
| DEC-06 | Source and Myanmar review | Track verified versus pending rules/labels/fixtures; full doctrine coverage remains a separate gate. |

These are explicit design tasks, not a blanket blocker for independent work. Routine technical choices consistent with approved behavior can be documented directly. A product/architecture change needs Kyaw's agreement.

## Current P0 assessment

The [Temporal/PostgreSQL protocol](../design/contracts.md#temporal-and-postgresql-consistency-protocol) now defines ingress/outbox delivery, stable IDs/generation/version fencing, model-outcome persistence, atomic domain commits, control/dispatch ordering, crash windows and separate replay contracts. This is a written specification, not a tested implementation.

Product language acceptance, P0 delivery gates and separate model-evaluation operations have been cross-checked against the same consistency/evaluation contracts; they do not claim the target stack is already running or that a model is accepted.

The [local cognition assessment](../design/model-evaluation.md) records the i7-8650U, 32 GB-class RAM, UHD 620 and approximately 72 GB free SSD snapshot, candidate models and a synthetic 24-case English/Myanmar protocol. Kyaw authorized necessary local setup/benchmarking on 2026-11-22. The model-assessment coordinator was stopped for the implementation-first instruction; no benchmark results are claimed and no application/database container was cut over. Results must be recorded before claiming any language or speed suitability.

## Implementation planning refinement

The development plan now breaks P0-P6 into dependency-linked execution packages, with intended source boundaries, concrete deliverables, required evidence, a prototype-to-target change map and package-level resumption rules. Implementation source now exists for the planned runtime boundaries. No application acceptance gate is claimed complete; model selection and integrated validation remain unfinished.

## Safe resumption

Continue code-only implementation against the design coverage map below. Do not run tests, builds, type checks, migrations, services or benchmarks without Kyaw's explicit execution request, even after source completion. Migration 003 is already applied and immutable; migration 004 is new source only and has not been applied. Preserve private `.env`, `.env.runtime`, legacy records and current uncommitted work. No push/deploy has been requested.

## Authorized implementation session

Kyaw authorized implementation, necessary dependencies, isolated local migrations, service setup and end-to-end tests on 2026-11-22, overriding the ordinary source-only convention for this task. Working against the approved P0-P6 plan. The executable v1 boundary in contracts resolves local endpoint/control/schema/supervision choices. Existing `.env`, legacy tables and catalog data are preserved. No implementation gate is yet claimed passed. Next: additive schema/repository and durable Temporal local conversation.

### Latest execution preference

Kyaw subsequently instructed implementation first: write the application without testing or running it until source implementation is complete. Builds, migrations, application startup and model benchmarks are deferred. The waiting assessment coordinator was terminated before it started the benchmark; the image download may finish independently. Requirements and this preference are preserved in `.agents/skills/citta-development/SKILL.md`, linked from `AGENTS.md`. This earlier wording was superseded by the explicit correction below: execution now requires a new request from Kyaw.

### Source milestone: continuing runtime and portal

Implemented source boundaries (not executed): additive `003_continuing_runtime.sql` and checksum migration runner; private isolated-database preparation; typed runtime contracts/configuration; PostgreSQL ingress/control/readback/outbox/action repositories; sufficient local consideration and independent ability checks; serialized Temporal workflow with nonblocking Activities, heartbeat/result review and bounded inference interruption; Ollama structured proposals; scoped real-file reads; existing Codex adapter cancellation; sourced memory correction; persistent motives/internal turns/contact policy/improvement proposals; React/Vite portal and Fastify HTTP/SSE; local supervisor/systemd/Compose source; isolated domain and Temporal replay commands.

Dependencies requested before the implementation-only instruction finished installing; package/lock changes are part of the approved stack. At this historical source milestone, no new application command, migration, build or test had yet been executed; the later execution/correction is recorded below. These packages are `implemented_unverified`, not verified gates. Additional source now includes explicit fenced workflow recovery, due recalls/reminders, goal revisions, contact intentions/replies/declines, candidate interests, legacy-note import and budget extensions. Remaining source work is the final boundary consistency review and any gaps it reveals. When Kyaw explicitly requests execution, the remaining acceptance work includes type/build checks, isolated integration/model/browser checks and full scenario classification. No source milestone authorizes those commands by itself.

### Execution correction: return to code-only

Kyaw objected to verification starting after the first source pass. That interpretation was premature. Effective immediately, code-only continues until an explicit request to execute; source completion does not authorize tests/builds/type checks/migrations/service starts/benchmarks. Agent-started runtime, Temporal and Ollama processes were instructed to stop. The original prototype process and original database remain untouched.

Before the objection, the following actually occurred: dependencies installed (OpenTelemetry API aligned to its SDK peer range); React build and TypeScript check passed after a nullable-state fix; six focused domain checks passed; eleven integrated checks passed against a separate `citta_agent_test` database, including Temporal history replay. Migration 003 applied to isolated `citta_agent_dev` and the test database. A private `.env.runtime` selects the isolated dev database; `.env` was not modified. Model weights only began downloading; no model quality benchmark ran. These are limited results, not acceptance of the full application. Do not rerun them or resume setup now. Migration 003 is now applied: never edit it; use additive 004 onward for future schema changes.

Code-only continuation after the correction: added explicit SSE connection shutdown during server close and inbox seen-state handling when the browser becomes visible. These changes have not been run, built or tested. Continue source work from this revision; the earlier successful build/check results do not cover these later edits.

## Design-to-code alignment (code-only, 2026-11-22)

Reviewed the approved architecture A01-A10, flows F01-F26 and their S/W examples against the continuing-runtime source. The table maps source ownership; **it is not executed scenario evidence or a claim that every model interpretation is correct**. Current source is `implemented_unverified`. No tests, builds, type checks, migrations, services or benchmarks were run during this alignment continuation.

| Design coverage | Source ownership / implemented path | Acceptance still deferred |
|---|---|---|
| A01, A10; F01 | Fastify loopback ingress/SSE, PostgreSQL receipts/outbox, per-agent Temporal task queue, React portal and local supervision | Complete deployed local path and restart operations |
| A02 | Pure consideration, attention, appraisal, preference, policy/review modules; Activity-only SQL/model/ability I/O | Maintainability and integrated boundary checks |
| A03; F05 | Migration 004 goal versions/transitions, agent-local decision sequence, pinned profile/engine/policy and actual commit state | Fresh/upgrade schema and full provenance comparison; existing legacy chronology is explicitly unknown |
| A04; F13, F18 | Atomic ingress/decision/action/result operations, dispatch reauthorization, claim/generation fencing, explicit unknown effects and recovery | Crash-window and uncertain-effect campaign |
| A05; F02-F04, F26 | Bounded recorded candidate ranking, due-source/fairness quota, nonblocking effects, parent/depth records, four-level deferred ingress and protected older inference | Rapid-input fairness, nested interruption, cancellation races and resume timing |
| A06 | Reference catalogs/simulator stay separate; English/Myanmar catalog and 89/121 views; ordinary decisions explicitly mark catalog `not-used` | Doctrinal source/terminology review remains separate from runtime acceptance |
| A07 | Pinned-version pure decision/attention replay, derived contact effects and continuity ledger comparison; separate Temporal history replay | New v2 replay/legacy-unsupported cases and isolated dispatch proof |
| A08; F16, F21-F22, F25 | Due recalls, versioned waiting criteria, persistent configured/scoped inferred motives, no-pending-work cues, grounded signatures, per-conversation topic history/backoff and global budgets | New-topic competence, genuine novelty and no-input/restart behavior |
| A09; F23-F24 | Durable expiring local contact intentions, quiet/reply/decline policy; specific improvement benefits/criteria/risks/scope and idempotent operator proposal review | Appropriate contact timing, repeated-topic semantics, evidence-backed proposal quality |
| F06-F07, F20 | Explicit memory origins, saved-only recall, source-preserving corrections/preferences and stale-context reconsideration without budget resets | Contradictory source handling, free-form scope resolution and preference influence |
| F08-F10 | Contextual tone, candidate/adopted tendencies, regulation and alternatives; affect-disabled comparison mode retains evidence/authorization | Contrasting praise/criticism/social contexts in both languages; no subjective feeling claim |
| F11-F12 | Sufficient local routines, recorded local cognitive proposals, bounded scoped abilities and optional gap-based/explicit Codex advice | Real model suitability, calibrated uncertainty and justified consultation |
| F14-F15, F19 | Attributed advice, observed source continuation, explicit generated criterion review, unmet/unknown waiting and independent uncertainty rendering | Semantic conflict checks and the supported quote/advice variants; no general factual-verifier claim |
| F17 | Scoped versioned goal cancellation/revision, pre-pause restoration, terminal-goal guard and rejection of stale results | Late effects, ambiguous cancellation and cancellation/recall races |

### Source corrections made in this pass

- Removed the current input from saved-memory recall and added evidence-origin metadata.
- Recorded bounded attention candidates and stable selection factors; eligible internal cues can participate at a protected background turn.
- Added per-conversation motive context signatures, backoff and source links. New timer IDs and repeated inferred thoughts cannot alone count as new grounded evidence. Global/default interests do not carry private last-topic text into another conversation.
- Added stale memory/preference checks before applying an asynchronous proposal; recorded outcomes survive reconsideration and used work budgets remain spent.
- Added pre-pause state restoration, bounded nested continuations and explicit old queued-work protection.
- Added scoped operator preferences, immutable goal version/state history, an inspector for actual continuity/context/effects and agent-local decision ordering.
- Added specific, reviewable improvement proposal metadata and versioned acceptance/decline. Acceptance remains non-executable; privilege-expanding proposals are declined.
- Added explicit generated success-criterion review and uncertainty rendering, effect/continuation replay comparison and modeled-affect ablation.

### Remaining work and safe next task

Continue source development against the same map, especially exact supported-task success criteria, interpretation ambiguity, scheduling/contact corner cases and replay completeness. Do not claim all S01-S60 or W01-W06 passed from this map; all new v2 behavior remains unexecuted, and model English/Myanmar quality plus human terminology review are unresolved. Future workspace self-edit/evaluation/release branches in F24/S55 remain outside the approved first-delivery execution boundary; no hidden adapter was added to imply otherwise.

Migration 003 remains unchanged. Migration 004 is new, unapplied source required by the newer repositories and inspector. Private `.env` and the existing database were not changed in this pass. Engine/policy and cognitive prompt/schema identities now identify v2; unsupported older replay is explicit. Architecture/flow drawings remain the approved baseline; no diagram was rewritten to excuse an implementation gap. The A03 draft `runtime.agent_*` examples map to the additive `citta.*` schema specified in contracts, preserving the legacy `runtime.*` tables.
