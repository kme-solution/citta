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

P0 also specifies persistent motivational dispositions, topic selection with no pending work, a global internal-work ledger, local inbox/contact policy, initiative deduplication/expiry and improvement-proposal records. Decide bounded topic-generation competence explicitly: Ollama is the agreed local cognition service and must not implicitly fall back to Codex. Evaluate a candidate model on English/Myanmar interpretation, structured proposals, uncertainty, latency, interruption and hardware/resource use before enabling it.

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

## Verification and change rules

Acceptance is incremental, not postponed until P6. Each phase verifies its affected boundaries before the next depends on it. Kyaw owns local installation, migration, builds and testing unless he explicitly asks the agent to perform them. When authorized, use a dedicated test database and isolated test-owned data, never automated cleanup against development notes/history. Add meaningful business, ownership, transaction and regression tests at that time; do not create cosmetic tests.

Record only executed checks in status, including commit/source revision when available, command/scenario, actual result and limitations. Existing dated evidence can be reused only while relevant code/configuration is unchanged. Rendered document checks do not count as application acceptance.

If a scenario exposes a conflict, update its owning specification and impact mapping before changing code. Stop only the dependent work; continue independent approved tasks. Do not silently revise the accepted diagrams to fit an implementation shortcut. Preserve diagram/scenario/requirement IDs.

P6 also validates Temporal workflow replay separately from domain scenario replay, dual-write recovery, stale local-inference results and degraded inference behavior. Record OpenTelemetry timing/error/usage alongside domain reasons. Confirm the chosen Compose/systemd setup keeps the agent available independently of the browser.

## Completion and later work

The first continuing-runtime delivery ends when its scope meets the gates above and status has credible evidence. The doctrine reference has a separate coverage gate. Browser/desktop/project actions, expanded natural-language reasoning and autonomous learning need their own scoped plans based on these same runtime boundaries; the old release numbering no longer governs development.
