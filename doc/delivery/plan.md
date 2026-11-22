# Development plan

**Basis:** A01-A10 architecture (accepted baseline plus the requested initiative refinement) and F01-F26 behavior, with S01-S60 acceptance examples and W01-W06 walkthroughs. It is a dependency-gated plan, not a promise that the prototype satisfies any phase. [Status](status.md) owns progress and open decisions; [contracts](../design/contracts.md) own detailed definitions.

## Delivery strategy

Build one continuing agent around durable state. Establish the Temporal-owned foreground loop and interruption/resumption with scripted inference/abilities before live model integration, then integrate contextual review and bounded abilities. Design recovery and replay fields from the first migration rather than adding them after effects have been lost. Each phase delivers a coherent vertical path and carries forward its scenario evidence.

No phase can skip data integrity, independent authorization, honest uncertainty or source attribution merely because live Codex is disabled. Scripted adapters exercise exactly the same lifecycle as real abilities. Keep current operations/reference commands usable during additive transition. A passing quote demonstration is one scenario, not a replacement for general acceptance.

## P0 - Lock executable contracts and transition scope

**Inputs:** requirements, approved architecture/flows, current code/schema, open decisions in status.

Deliver a reviewable implementation specification for stable IDs, data/state transitions, frame versus goal/run ownership, atomic operations, adapter cancellation/idempotency/reconciliation, endpoint/event payloads, policy defaults, evidence handling and schema upgrade order. Trace each choice to requirement/diagram/scenario IDs. Identify unsupported free-form interpretation cases and the exact bounded contexts to implement first. The framework stack is agreed in the architecture baseline; actual local model/hardware selection requires measured evaluation, not silent substitution.

Review migration source against both the fresh database path and current tables; define ownership, indexes, migration bookkeeping and any explicit import. Specify Temporal workflow/activity/message boundaries, history continuation/versioning, PostgreSQL source-of-truth records, outbox/idempotent dual-write recovery and separate workflow/domain replay. Define Fastify HTTP/SSE endpoints, React readback/control state, inference schemas and the capability registry before implementation. Preserve existing data and avoid making the original draft schema an accidental contract.

**Gate:** every ambiguous state transition needed by P1/P2 has a written decision or explicit blocking question. A diagram branch cannot be implemented as a TODO or hardcoded successful reply. Product changes require Kyaw's agreement; routine implementation details consistent with approved behavior can be resolved and recorded directly.

**Trace:** REQ-01 through REQ-18; A01-A10; especially F03-F05, F13, F17-F18. No runtime acceptance is claimed by completing P0.

P0 also specifies persistent motivational dispositions, topic selection with no pending work, a global internal-work ledger, local inbox/contact policy, initiative deduplication/expiry and improvement-proposal records. Decide bounded topic-generation competence explicitly: Ollama is the agreed local cognition service and must not implicitly fall back to Codex. Evaluate a candidate model on English interpretation, structured proposals, uncertainty, latency, interruption and hardware/resource use before enabling it.

P0 now uses the concrete [Temporal/PostgreSQL consistency protocol](../design/contracts.md#temporal-and-postgresql-consistency-protocol) as the consistency specification. Its crash-window matrix must become meaningful failure-injection acceptance during implementation; writing the protocol does not validate it. DDL and APIs remain separate unfinished P0 deliverables.

The [hardware/model assessment](../design/model-evaluation.md) and English cases in the paired fixtures define model evaluation. Record exact model/service/image identities, schema and semantic outcomes by language, critical failures and measured cold/warm latency. No candidate is accepted solely because it fits RAM or produces valid JSON. A benchmark is a separate local service assessment, not proof of the integrated runtime. P3 must retain failed/unsupported outcomes and inference budgets; performance limits cannot silently turn every difficult message into Codex consultation.

## P1 - Durable local conversation and one decision owner

Implement additive persistence/contracts, composition root, agent/profile pinning, durable ingestion/deduplication, one stable Temporal workflow identity per agent and a minimal consideration/action/review path using scripted cognition initially. Provide scoped profile and local memory responses with explicit uncertainty and an inspectable decision snapshot. Unsupported input clarifies. Initialize goals, budget accounting, pending actions and continuation identifiers now so later phases do not replace the data model.

Use an independently checked local `RESPOND`, `CLARIFY`, `RECALL` or `WAIT` operation. Record original observations, selected context, reason and actual returned state. Distinguish transport receipt from considered response. Introduce Fastify HTTP/SSE and React/Vite durable conversation/readback through the portal and remove direct Codex ownership from that new path. Do not wire live advice yet.

**Gate:** zero-adviser local profile/memory cases traverse durable real cycles; duplicate input has one logical outcome; ownership scope holds across two tabs; refresh retrieves the same committed response. An invalid profile or missing context fails/clarifies explicitly. Crash points around input/decision commits preserve consistent state.

**Trace:** REQ-01, REQ-03, REQ-04, REQ-09, REQ-12, REQ-14; A01-A04; F01-F02, F06-F07, F13, F15; S01-S04, S12, S21, S39.

## P2 - Interruption, controls and safe continuation

Use Temporal messages, durable timers and asynchronous activity outcomes to implement checkpointed foreground/continuations, classification of interruption versus correction/cancellation, fair selection, nested limits and versioned budgets. Use a controllable pending scripted ability to demonstrate that a new local question is answered before the earlier action completes. Results enter queues; only the runner advances consideration. Add actual foreground/suspended/waiting indicators and pause/resume/stop controls with reconnection support.

Persist and reconcile cancelled/paused/pending effects. A correction invalidates affected assumptions or queued actions without rewriting historical results. Late results cannot revive a cancelled goal. An ambiguous cancellation asks for scope. Resume reloads criteria, remaining budget and pending effects before deciding again.

**Gate:** W01 and W03 work with a pending scripted action; no repeated completed read/action; pause/cancel/current goal version is respected; restart restores a suspended frame; fairness preserves earlier work amid rapid input. Measure selection/local-response latency separately from adviser duration.

**Trace:** REQ-01, REQ-02, REQ-05, REQ-10, REQ-12; A03-A05; F02-F05, F17-F18; S02, S07-S12, S24, S33-S37.

## P3 - Sourced context, meaningful commitments and modeled affect

Integrate evaluated Ollama schema-constrained cognitive proposals with deterministic evidence/scope checks; implement bounded retrieval, observed/reported/inferred/configured distinctions, goal versions/success criteria, due recall and correction lineage. Add contextual appraisal, optional unknown tone, candidate reaction tendencies and reflective choice. Keep each appraisal linked to its interpretation/evidence and policy version. Make its influence observable without giving it authority over permissions or facts.

Exercise the same words in different contexts, including useful criticism, unsupported criticism and praise contradicted by evidence. Implement a bounded supported reviewer for the initial task contexts; unsupported language or claims remain uncertain. A due recall can start useful work without a new message, but it cannot resurrect a cancelled commitment or spin without a trigger. Preserve budgets through waiting and resumption.

**Gate:** W02 and contrasting scenarios show evidence-based correction and contextual differences, not emotion-word matching. The trace can explain whether appraisal changed attention/action; disabling it preserves safety/authorization. Relevant memory is scoped and bounded; contradictory claims retain provenance. Recalls emit once and only active eligible work proceeds.

**Trace:** REQ-04 through REQ-06, REQ-14; A02-A03, A05-A06; F06-F11, F15-F16, F19-F20; S13-S27, S36-S38, S41-S42.

P3 includes F21-F26: persistent interests/ambitions and internal turns can choose fresh topics, reflect locally, propose bounded exploration or adopt a goal without a message, pending task, old failure or unfinished commitment. Implement causal deduplication, budget/backoff and quiet state without erasing motivation. Operator control and the same foreground owner govern all initiative. Local model-assisted consideration must not silently depend on Codex. Sufficient profile/local routines remain deterministic. Enable pgvector only after scoped retrieval evaluation; vector similarity is not evidence of truth.

Proactive local conversation can originate from a relevant idea or shared interest, not only a reminder. Persist the outgoing intent/inbox state; honor availability, topic novelty, expiry and unanswered/declined contact. Capability improvement first produces a reasoned reviewable proposal; code/model changes remain outside the initial execution scope. Exercise W04-W06 and S43-S60 with scripted internal turns and no new user input, including no-pending-work cases, interruption, quiet requests, restart/deduplication and replay snapshots. This extends REQ-15 through REQ-18 and A08-A09; no phase gate may omit these as future-only behavior.

## P4 - Bounded local abilities and evidence-first completion

Integrate the typed registry and approved fixture `READ` into the existing durable action lifecycle. Validate paths including resolved symlinks, enforce scope, record content lineage and inspect actual outcomes. Use a quote scenario whose evidence is sufficient locally: the runner identifies what is missing, reads applicable evidence, reviews success criteria and records a sourced conclusion with no consultation.

Adapter declarations cover deadlines, cancellation, idempotency and reconciliation. Errors and uncertain results must remain visible and resumable. A configured preference or goal string is not executable authority. Validate external-content instruction attempts against the independent checks already present.

**Gate:** S05 completes from actual fixture evidence with zero adviser dispatches. Failure, stale evidence, conflicting estimates and out-of-scope reads produce correct state/review. No hidden fixture-only logic sits outside the shared runtime. An adapter returning text cannot independently complete the goal.

**Trace:** REQ-04, REQ-05, REQ-07, REQ-09, REQ-10; A02-A04; F06-F07, F11, F13-F15; S05, S22-S23, S27, S30, S35, S40.

P4 also demonstrates self-originated permitted local exploration and an evidence-backed improvement proposal. A repeated concern without new eligibility does not trigger repeated reads, messages or calls. The proposal records what was learned versus what remains unverified and stops before an executable self-change.

## P5 - Optional justified adviser through the same lifecycle

Wrap the existing Codex CLI as `CONSULT_AI`. Require the gap/requested role, reason local alternatives are insufficient, permitted context and budget before dispatch. Enforce one in-flight adviser slot per agent, nonblocking foreground attention, bounded output/deadline and explicit authentication/unavailable/timeout outcomes. Never send the entire environment or unrelated private history.

Store the result as attributable speech. In the adviser-needed quote variant, verify the suggestion against actual notes before concluding. Unassessable free-form advice is reported as unverified; do not manufacture a verifier. A second consultation waits without blocking local messages. User cancellation and late process output follow P2 semantics.

**Gate:** S06-S08, S28-S32 and W03 pass with a scripted adviser; when Kyaw requests a live smoke check, verify the same boundary with real Codex separately. A local-sufficient case still produces zero adviser actions. Advice conflicts are exposed, no unauthorized context is sent, and no result causes cancellation reversal.

**Trace:** REQ-02, REQ-07, REQ-09, REQ-10, REQ-14; A01-A05; F04, F11-F15, F17; S06-S08, S25, S28-S32, S40.

## P6 - Offline replay and integrated release acceptance

Implement the replay composition using recorded context, clock, profile/policy/catalog versions, attention candidates, appraisals and ability outcomes. It has no live queue consumption or live ability access. Compare normalized decisions, effects, switches and continuation positions. Reject unsupported versions explicitly rather than replaying under current configuration silently.

Run the full agreed scenario suite with Kyaw, emphasizing fresh/upgrade migration paths, ownership and deduplication, multiple input sources, interrupted dispatch, cancellation, budget exhaustion and durable UI reconnect. Review representative desktop/mobile layouts and keyboard composition. Verify the zero-input/no-pending-work topic and local-conversation cases, motive adoption/deferral, global initiative/contact budgets and proposal-only improvement boundary. Replay source/availability/novelty inputs so autonomous openings do not duplicate. Compare matched recall/affect-enabled and disabled runs without claiming human equivalence from the result.

**Gate:** every REQ-01 through REQ-18 item is traced to evidence or explicitly pending scope. All S01-S60 and W01-W06 are classified as executed/passed, failed, or unsupported with a visible limitation; unsupported required behavior prevents claiming the full scope complete. No broader language/doctrine coverage is implied. Existing reference commands remain intact. A clean replay cannot contact Codex or mutate live work.

**Trace:** all A/F/S/W identifiers; particularly REQ-10, REQ-11, REQ-13, REQ-14 and A06-A07.

## Execution packages and dependencies

These packages make P0-P6 executable without changing the approved behavior. Paths below are intended code ownership, not a statement that files/commands already exist. Final interface names are resolved in P0. Keep one package small enough to review and resume; do not start another package to hide a failed gate. The status document records actual state per package when implementation starts.

| Package | Depends on | Source/configuration boundary and concrete deliverable | Required completion evidence |
|---|---|---|---|
| P0.1 protocol and state agreement | Approved A/F/S/W baseline | `doc/design/contracts.md`: ingress/outbox, ownership generation, domain/control/frame versions, complete legal transition tables, API/event envelopes and failure outcomes | Every P1/P2 write/dispatch/control has an owner, stable key, transaction and recovery rule; unresolved choices explicitly listed |
| P0.2 laptop/model decision | Existing evaluation service only | `doc/design/model-evaluation.md`, `data/evaluation/`, `tools/evaluation/`, `artifacts/evaluation/`: CPU/RAM snapshot and measured candidate results | English outcomes required; Myanmar outcomes retained as deferred scope; critical failures and actual cold/warm latency visible; no automatic production integration |
| P0.3 schema and upgrade specification | P0.1 | Additive DDL/migration source proposal, dependency order, constraints/indexes and legacy-note compatibility; no applied migration rewritten | Review fresh/upgrade paths and exact invariants before execution; existing data preservation explicit |
| P0.4 interface and local deployment specification | P0.1; hardware evidence informs resource limits | Typed API/SSE/control/reconnect contract, Ollama proposal schema, Temporal task/workflow/activity roles, local supervision configuration and private configuration loading | No circular database/journal authority, unavailable command or secret in public config; model outage/control behavior specified |
| P1.1 foundation and profile | P0.1, P0.3, P0.4 | `src/app/` composition/configuration and `nama`; immutable profile version, agent identity and dependency injection; dedicated test configuration when authorized | Blank attributes remain unknown; no secret/profile leakage; invalid setup fails explicitly |
| P1.2 domain persistence and outbox | P1.1 | `src/infra/postgres/`: ledger-managed additive migration, scoped repositories, receipt/outbox, operation-result lookup and versioned commits | Same input key returns same receipt; conflicting payload rejected; commit/acknowledgement failure cases preserve one logical outcome |
| P1.3 foreground workflow and local cycle | P1.2 | `modules/vithi`, `dvara`, `cetana`, `sikkha`, `kamma`, `paccavekkhana`: stable Temporal owner, handler enqueue, scripted inference, deterministic local response and committed review | A real local profile/memory request traverses HTTP/input to durable decision/action/result; no Codex required; stale/duplicate operations fenced |
| P1.4 first portal vertical slice | P1.3 | Fastify entry point and React/Vite portal; receipt versus response, domain-event readback/SSE and scoped history | Refresh/two tabs see committed history; no session-storage-only authority; keyboard/composer behaviors retained |
| P2.1 continuations and control ordering | P1.3 | `vithi` foreground/suspended frames, goal/control versions, pause/resume/cancel dispatch barrier and reconciliation | W01 with scripted pending work; clear stop prevents new dispatch; ambiguous scope clarifies; no stale result revives cancelled work |
| P2.2 nonblocking activities and fairness | P2.1 | Temporal timers/messages and pending inference/ability handling, nesting/fairness/global budgets, history continuation | Local response precedes pending scripted ability completion; starvation, rapid-input/two-tab and restart cases preserve earlier work |
| P2.3 visible control and continuity | P1.4, P2.2 | React foreground/suspended/pending state, exact control receipts/outcomes and reconnect cursor | W01/W03 observable without terminal interpretation; UI does not invent cancellation or success |
| P3.1 sourced context and commitments | P2.2 | `sati`, `chanda`, scoped repositories: source-linked memory, belief correction, success criteria, due recalls and bounded retrieval | Observed/reported/inferred/configured records remain distinct; only eligible recalls emit once; old claims remain inspectable |
| P3.2 internal motivation and new topics | P3.1 | `chanda`, `vithi`, `manasikara`: persistent dispositions, fresh-topic candidates, internal observations, adoption/deferral and global-work ledger | W04 begins with no message, pending task or unfinished commitment; its chosen topic/action has an inspectable motive, outcome and budget |
| P3.3 evaluated local cognition | P0.2 model gate, P3.1-P3.2 | Consumer inference port plus `infra/ollama` Activity adapter; schema/domain checks, persisted model outcomes, stale-result fencing, usage/resource budgets | English semantic cases; no external fallback; cached Activity retry does not re-infer a committed outcome; outage leaves controls responsive |
| P3.4 contextual appraisal and review | P3.1-P3.3 | Application `vedana`, `cetana`, `paccavekkhana`: contextual tone/tendency/alternatives and outcome feedback | W02; useful criticism, false praise and ambiguity give grounded alternatives; affect changes are explainable and cannot override evidence/scope |
| P3.5 proactive interaction and improvement proposals | P3.2-P3.4; pending ability contracts from P2 | Durable local outgoing-inbox turns, availability/topic/expiry/rate policy, proposal records and current-versus-proposed capability lineage | W05/W06; fresh shared-interest opening without a request; silence is not rejection; no duplicate nudge/restart; no executable self-upgrade |
| P4.1 permitted evidence abilities | P3.1; P1 action framework | `kamma` registry and fixture reader with normalized effects, resolved-path scope, failure/deadline/reconciliation declarations | S05 completes from an actual permitted source; out-of-scope and malicious content cannot expand permissions |
| P4.2 evidence-first integrated initiative | P3.5, P4.1 | Same runtime for self-originated investigation, memory review, quote conclusion and evidence-backed improvement proposal | Local-sufficient task uses zero external-adviser calls; demonstrated result changes the goal/review; no scripted-success bypass |
| P5.1 adviser lifecycle | P2, P3.3, P4 | Existing Codex adapter behind the typed registry; justified gap, minimized context, external slot/budgets and explicit failures | A request can be deferred/denied independently of the model; local tasks and controls remain available while advice is pending |
| P5.2 advice review and conflicts | P5.1, P4.2 | Reported-speech lineage, independent evidence checks, unverified-answer handling and interruption/cancellation | S06-S08, S28-S32, W03; no blind trust, late-result revival or repeated uncertain external effect |
| P6.1 replay and failure campaign | Earlier phases supply snapshots/checkpoints | Separate domain replay composition and Temporal replay checks; live inference/queues/adapters inaccessible; crash-window matrix automated when testing authorized | Same recorded choices/effects/switches or explicit unsupported version; crash/retry/duplicate/outage cases meet domain invariants |
| P6.2 integrated acceptance and local release | P6.1 and all prior gates | Scenario/evidence review, English everyday-interaction review, desktop/mobile inspector and bounded supervised deployment | REQ-01-REQ-18, all S01-S60/W01-W06 classified with actual evidence; required unsupported cases block full completion |

P0.2 may proceed while protocol work is unfinished. Infrastructure, deterministic local routines and scripted interruption tests can proceed without a selected production model; enabling model-assisted autonomy cannot. P3.1/P3.2 can be developed with recorded/scripted proposal inputs, but P3 completion requires the evaluated live local model and integrated evidence. Do not let a model benchmark block unrelated schema work, or let schema progress silently waive model quality.

## Implementation change map

| Existing area | Treatment during transition |
|---|---|
| `src/app/portal.ts` | Keep prototype available until the Fastify/React durable path passes its replacement gate; do not claim its existing synchronous Codex call is the target workflow |
| `portal/` | Preserve keyboard, composition, composer and scrolling behavior in the React replacement; move/delete replaced assets only after visual/workflow verification |
| `src/modules/nama/` | Reuse validation and explicit unknown fields; extend with immutable persisted profile/version ownership |
| `src/modules/cetana/vaca-service.ts` | Retain sufficient local response routines; replace keyword-as-deliberation with validated interpretation/context and a recorded decision contract |
| `src/modules/cetana/vaca-codex.ts` | Wrap the existing adviser process behind the durable adapter; preserve temporary-directory isolation/errors while adding idempotency/attempt/scope semantics |
| `src/infra/postgres/` and applied SQL | Preserve legacy data and scenario readers; add scoped repositories/ledger-managed migrations and explicit repeat-safe imports |
| Catalog and doctrinal modules/data | Preserve identity/classification/reference behavior; do not rewrite them to fit an application thought loop |
| Evaluation tools/fixtures | Keep synthetic evidence reproducible; distinguish model smoke results from integrated acceptance |
| Public scripts/configuration | Add only working commands in the package actually implementing them; update operations in the same change; never overwrite populated private `.env` |

Avoid an all-at-once rewrite. The replacement portal/runtime must have an explicit cutover and rollback path that preserves committed input, notes and profile/configuration. A reversible code rollback must not require dropping new domain data or editing old applied migrations. Installation, DB migration and service cutover are explicit operations, never implied by a documentation update.

## Package completion and resumption record

For each package, record in status: package ID, requirement/diagram/scenario references, concrete changed boundary, source/commit identity when available, checks actually executed, observed outcome, limitations/open decisions and the exact next safe task. Never mark a phase complete from a subordinate package or a model benchmark alone.

Use `not_started`, `in_progress`, `implemented_unverified`, `verified`, or `blocked` with a concrete reason. A product decision blocks only its dependents. When a task is interrupted, preserve what is already implemented/verified rather than reopening the entire architecture. Do not invent calendar estimates before the model/hardware and migration-interface evidence exists; dependencies and acceptance determine order.

## Verification and change rules

Acceptance is incremental, not postponed until P6. Each phase verifies its affected boundaries before the next depends on it. Kyaw owns local installation, migration, builds and testing unless he explicitly asks the agent to perform them. When authorized, use a dedicated test database and isolated test-owned data, never automated cleanup against development notes/history. Add meaningful business, ownership, transaction and regression tests at that time; do not create cosmetic tests.

Record only executed checks in status, including commit/source revision when available, command/scenario, actual result and limitations. Existing dated evidence can be reused only while relevant code/configuration is unchanged. Rendered document checks do not count as application acceptance.

If a scenario exposes a conflict, update its owning specification and impact mapping before changing code. Stop only the dependent work; continue independent approved tasks. Do not silently revise the accepted diagrams to fit an implementation shortcut. Preserve diagram/scenario/requirement IDs.

P6 also validates Temporal workflow replay separately from domain scenario replay, dual-write recovery, stale local-inference results and degraded inference behavior. Record OpenTelemetry timing/error/usage alongside domain reasons. Confirm the chosen Compose/systemd setup keeps the agent available independently of the browser.

## Completion and later work

The first continuing-runtime delivery ends when its scope meets the gates above and status has credible evidence. The doctrine reference has a separate coverage gate. Browser/desktop/project actions, expanded natural-language reasoning and autonomous learning need their own scoped plans based on these same runtime boundaries; the old release numbering no longer governs development.
