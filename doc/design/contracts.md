# Runtime contracts

**Role:** derived implementation specification for the approved [architecture](architecture.md) and [behavior flows](behavior-flows.md). These contracts consolidate the design; they do not authorize changes to its behavior. Detailed DDL and interfaces must satisfy the P0 review gate in the [development plan](../delivery/plan.md). Open choices live in [status](../delivery/status.md#open-decisions).

## Non-negotiable invariants

1. One agent has one foreground object and one decision owner. Ingestion and ability completions may be concurrent but only persist observations/results.
2. Accepted input is durable and deduplicated. Consideration links the original input, context, goal, candidate actions and chosen reason.
3. Decision/goal updates, consumed input and a queued action commit atomically. No external call runs inside a SQL transaction.
4. Authorization is independent of the planner/interpreter. Approval, where needed, is tied to exact arguments. Check scope again before dispatch.
5. External success is established from observed effects. Unknown effects are reconciled, not blindly retried. Stable event/action identities prevent logical duplication.
6. Interruptions preserve criteria, evidence, pending effects and remaining budgets. Corrections/cancellations cannot be undone by stale plans or late results.
7. Evidence, reported speech and hypotheses remain distinguishable. Appraisal does not establish truth, permission or a completed success criterion.
8. Replay is isolated from live queues and abilities. Engine, policy, profile, catalog identity and decision inputs are pinned or recorded.
9. Secrets and unrelated conversation data stay out of prompts/traces. Selected profile context is minimized and disclosed when an adviser is used.
10. Doctrinal moments and engineering cycles are separate. No timer, queue or scalar is automatically a mental factor or subjective feeling.

## Module ownership and intended source structure

The existing application remains one private strict-TypeScript ESM package. Reuse existing modules and functions where they satisfy the boundary; do not rename unrelated code merely to match this tree. ASCII Pali names are software ownership labels, not definitions of doctrine.

```text
src/
  app/                  # CLI, portal, runner entry point, configuration, composition root
  contracts/            # Only shared plain-data boundary types
  modules/
    nama/               # Validated identity and profile versions
    dvara/              # Observation ingestion and provenance
    manasikara/         # Attention and stable selection factors
    sati/               # Scoped memory, correction lineage and recall
    chanda/             # Commitments, priorities and success criteria
    cetana/             # Interpretation, consideration and proposed intention
    vedana/             # Explicitly modeled application appraisal
    sikkha/             # Independent constraints and authorization
    kamma/              # Registry, typed ability adapters and effect normalization
    paccavekkhana/       # Outcome comparison and reconsideration
    vithi/              # Temporal workflow orchestration, continuations and domain replay
    citta-sangaha/       # Existing doctrinal catalog
    cetasika/           # Existing doctrinal associations and feeling reference
    citta-vithi/        # Existing doctrinal simulator, separate from application vithi
  infra/postgres/       # Repository implementations, pool and transaction handling
```

Domain consideration/review receive plain data and perform no network/SQL calls. Repository interfaces belong with their consumers; PostgreSQL implementations stay in infrastructure. Compose recorded clock/IDs, repositories, inference and abilities explicitly. Temporal workflow code stays deterministic; SQL/network/model calls run through activities. Keep model adapters outside pure domain checks. Wrap the current Codex adapter before relocating it; integration changes must not broaden permissions.

## Records and lineage

| Record | Required meaning and fields |
|---|---|
| Agent/profile version | Stable agent ID; validated configured attributes; immutable profile snapshot/version; creation/revision provenance |
| Observation | Stable event ID/key; agent and optional conversation/run; kind and channel; source/speaker; original payload; received/available times; optional door, parent action and related observation |
| Memory | Kind: configured, observed, reported, inferred or commitment; content; source observation/evidence IDs; agent/conversation scope; validity/review status; timestamp and superseding record |
| Goal/version | Originating observation/memory; description; explicit success criteria; status; priority with reason; due condition; version and change history |
| Run/cycle | Agent; pinned profile/engine/policy/catalog identity; ordered sequence; selected observation; lifecycle timestamps; stop reason; budget ledger |
| Consideration snapshot | Interpretation/uncertainty; selected/rejected attention candidates; retrieved record IDs/content versions; active goal/version; known evidence; missing facts; action alternatives/rejection reasons; clock and budget state |
| Intention/action | Goal/version where relevant; typed kind/validated arguments; expected effect; permission/disclosure needs; deadline; stable idempotency key; claim token/lease; attempt/outcome state |
| Approval | Action and argument hash; deciding party; decision/time; only valid for the exact still-current proposal |
| Effect/review | Actual result with source and action; resulting observation IDs; criterion status: met/not_met/unknown; contradictions; unresolved gaps and chosen next step |
| Foreground/continuation | One foreground row per agent; suspended goal/run; last committed cycle; summary and evidence IDs; pending action; remaining budgets; suspension/resume conditions; parent interruption and policy version |
| Appraisal/affect event | Cause/context IDs; interpreted significance; alternatives/confidence; modeled tone; candidate/adopted/inhibited tendency; chosen response and reflection; rule/version |

Stable shared IDs and foreign keys preserve agent ownership and source/result lineage. Keep queryable state in typed columns and structured payload/detail in JSON. Do not store an invented introspective monologue as decision evidence. Use indexes for ready input, due recall, pending actions, goal status and lineage; never scan full history for each turn.

## State and action vocabulary

Goal/task states follow F05: `active`, `suspended`, `waiting`, `paused`, `completed`, `exhausted`, `cancelled`. Keep goal progress distinct from foreground frame ownership, action status and run status. A paused task resumes only after explicit control; ordinary suspension can resume automatically under attention policy. An exhausted task needs an explicit budget extension. Waiting requires a named trigger/deadline. Completed/cancelled goals do not resume.

Observations use `pending`, `claimed`, `consumed`, with defined cancelled/invalid terminal handling. Actions use `queued`, `claimed`, `running`, `succeeded`, `failed`, `unknown`, `denied`, plus explicit cancellation/supersession handling in the finalized transition table. Never infer that an in-flight action was safely cancelled just because its goal was cancelled. Exact legal transitions, token checks and transaction ownership are a P0 deliverable; undocumented states are not implementation choices.

Initial proposed action kinds: `RESPOND`, `CLARIFY`, `RECALL`, `READ`, `CONSULT_AI`, `WAIT`. A response is a local communication effect; adviser output enters as reported speech and is reviewed before any supported conclusion. Browser, desktop, coding and publishing operations are future adapters with separate scope, not implicit variants of READ or CONSULT_AI.

## Attention, interruption and resumption

Follow F02-F05 and F17. Select stop/pause/cancel controls first. A new operator message normally interrupts background work at the next atomic decision boundary. Relevance, explicit urgency, availability time, received time and stable ID provide recorded selection factors. A bounded fairness policy prevents continuous conversation from losing unfinished work. A message receipt is transport acknowledgement, not Citta's considered reply.

Checkpoint the current frame before selecting an interruption. Resolve whether new input is a brief question, independent task, correction, cancellation or ambiguous reference. New tasks have their own success criteria. Before resumption reload the goal version, stop state, evidence, pending effects and budget; never execute the saved next action without reconsideration. Results from a suspended task queue until selected. Multiple tabs cannot create concurrent owners.

Allow at most one external adviser action in flight per agent initially. Dispatch and wait without blocking local attention. Additional consultations wait for that slot. Late results retain the original action/goal version and cannot revive cancelled work. Pause prevents new dispatch; stop/cancel semantics must state what happens to pending effects. Do not reset deadlines or call budgets on interruption, reload or restart.

## Context, appraisal and deliberation

Retrieve current task/conversation context before permitted agent-wide records. Prefer explicit source/goal links; bound results and text. Lexical matching is not semantic retrieval. An unknown attribute or unsupported interpretation remains unknown; clarify rather than force a fluent answer.

Identity is configured in `.env`, validated at startup and pinned per run. `CITTA_GOALS` expresses background preferences, not executable commands or permission. Chat does not silently overwrite the profile. Age is static configured years; no automatic aging policy is implied.

Application modeled tone is `pleasant`, `unpleasant`, `neutral`, or `undetermined`. The last value means insufficient modeling evidence, not a fourth doctrinal feeling. Separate tone, interpretation, reaction tendency, optional task-scoped affect summary and chosen action. Compare same words under different contexts. Appraisal can affect recorded priority or candidate selection within constraints; it cannot falsify evidence, override controls or fabricate bodily distress. Longer-lived summaries require explicit update/expiry rules and remain hypotheses.

Consider local evidence and abilities first. `CONSULT_AI` requires a named information gap or requested adviser role, a relevant goal/request, applicable permission/disclosure and remaining budget. It is not triggered merely by a question mark, “why,” or an emotion word. Do not use an external adviser merely to decide whether to use that adviser. If unrestricted advice cannot be evaluated, label it unverified rather than declaring the task met. General natural-language inference is an open design decision; deterministic examples do not establish that competence.

## Persistence and upgrade boundary

Use additive versioned SQL migrations, a migration ledger/checksum, ownership constraints and explicit fresh/upgrade paths. Existing migrations 001/002 are already applied locally and must not be rewritten. Preserve `runtime.memories`, `runtime.goals`, `runtime.history` and `runtime.portal_notes` data and existing reference commands.

The existing demo memory/goal schema is incompatible with the richer contracts. Use `runtime.agent_memories` and `runtime.agent_goals` for the new contracts, not in-place repurposing of legacy tables. Add agents, profile versions, runs, observations, cycles, decisions, actions, approvals, recall tasks, foreground/continuations and appraisal records. Physical DDL, dependency order and any review/effect tables are finalized at P0; the A03 map is not a ready-to-run migration.

If selected old notes/commitments are imported, use explicit repeat-safe source keys, ownership and a documented transformation. Do not turn old demo logs into claimed new-runtime cycles. Existing file-backed catalog data stays pinned by deterministic identity/checksum until a separately scoped import/versioning task. Do not prescribe new database libraries or a PostgreSQL upgrade without demonstrated need.

## Transaction, recovery and replay boundary

1. Use one stable Temporal workflow identity per agent as the decision owner; apply idempotency, domain-version checks and action claim fencing at PostgreSQL write/dispatch boundaries. Do not introduce a competing custom foreground scheduler.
2. Persist accepted input with a stable source key. Recall emission and recall-task completion are atomic.
3. Read/snapshot the bounded decision context. Commit consideration, goal changes, consumed input and queued action together.
4. Claim the action in a short transaction, recheck permissions/control state, and dispatch outside SQL.
5. Commit actual effect and derived observations together with stable action/output keys. Review them through the foreground stream.
6. Recover uncommitted expired claims. Retry external effects only if safe under the adapter's idempotency/reconciliation contract; otherwise keep `unknown`.
7. Resume foreground/continuations with the same remaining budgets. Replay under a distinct run identity using recorded time/context/effects and no live dispatch/input access.

Temporal orchestration and PostgreSQL commits are not one transaction. Use durable ingress/outbox delivery and idempotent activity/domain operations; neither framework retry nor locking alone makes external effects exactly once. Define the crash window between marking an action running and dispatch, as well as after dispatch before result commit. Completion must report observed state honestly.

## Proposed engineering limits

These are starting tunables for evaluation, not doctrinal constants or measured guarantees. Freeze selected values with policy versions before acceptance runs; record changes in status.

| Parameter | Starting proposal |
|---|---|
| Retrieved context | At most 20 records and 16 KB text per consideration |
| Nested interruption frames | At most four; further messages queue |
| Background fairness | One eligible continuation after three ordinary interruptions unless a control/explicit urgent task takes priority |
| Task budget | 12 cycles, two adviser calls, five minutes elapsed work |
| Adviser deadline | 120 seconds per call; one in-flight slot per agent |
| Recall | One pending recall per outstanding waiting reason |
| Responsiveness target | Select operator input within one second at safe boundaries; local response within two seconds; measure before promising |

## Portal/API boundary

Server input validation persists observations, then subscribes to the runner; the target portal never directly calls Codex. Durable history is authoritative; session storage only caches references. Use actual committed events with run/cycle/action/goal-version IDs for receipt, selection, consideration, authorization, dispatch, observation, review, waiting, completion and controls. Preserve current keyboard/composer/scroll behavior.

Define create/read/control/reconnect endpoint contracts at P0, including authorization scope, duplicate key, stream cursor and stale-control handling. Browser disconnect does not cancel a goal. UI pause/resume/stop must show actual pending/unknown effects, not fabricated progress. Redaction is applied before event delivery and replay export. Catalog and doctrinal inspector remain separate views from the application trace.

## Internal motivation and self-originated activity

F21-F26 and A08-A09 refine the first-delivery contract. An enabled running agent must be able to originate consideration even when there is no incoming message, pending goal, unfinished commitment or new external evidence. Mere recall scheduling does not satisfy this requirement. Persistent interests, desires and ambitions can supply a fresh topic and a candidate activity without somebody asking first.

`chanda` owns a versioned motivational disposition: named interest/aspiration, origin and evolution, relevant values/associations, current significance and last-considered topic/outcome. Origins distinguish explicit configuration, operator feedback, observed experience and proposed/inferred interest. Inferred motives are hypotheses, not evidence of human instincts or new execution authority. The agent may develop task-scoped candidate interests within its granted exploratory scope; changing core values, identity or permissions remains a separate decision.

The `vithi` scheduler provides bounded recurring internal turns when enabled. The internal cue producer reads a bounded snapshot of motives, memory/associations, recent appraisals/outcomes and available abilities. It may choose a new reflection topic or permitted exploration when no task exists. It persists a deduplicated `mental` application observation with the motive/topic origin, relevance, novelty, last outcome, policy/version and causal memory IDs. This is a software event type, not proof of literal mental experience. Cue production does not adopt goals, mutate priorities or dispatch abilities independently; the foreground runner does that.

If configuration/history is initially sparse, use transparent, policy-versioned bootstrap dispositions such as bounded curiosity, improving understanding/capability and appropriate connection. These are declared application defaults, not invented autobiographical memories or a claim of innate human drives. They can choose a fresh local topic such as reviewing available capabilities or an allowed subject. P0 must specify supported topic sources and allowed scope; lack of personal history does not force a permanently message-only agent.

Separate these records:

| Record | Meaning |
|---|---|
| Motivational disposition | Persistent interests, desires, ambitions and contextual relevance, not an executable command |
| Topic/candidate motive | Something Citta elects to consider, with origin, novelty, intended benefit/interest and uncertainty |
| Adopted goal | Deliberately selected commitment with criteria, scope, priority and budget |
| Local reflection | A bounded consideration/review operation that can update supported interpretations without producing speech or external calls |
| Outgoing initiative | A proposed conversation turn with intended topic/recipient, reason, timing, expiry, deduplication and delivery state |
| Improvement candidate | Evidence of a limitation or opportunity, desired change, criteria, scope, risks and proposal/version state |

Supported self-originated activity includes reflecting on an experience, exploring a permitted subject out of interest, considering alternative futures, forming a new bounded goal, reviewing a belief, preparing a question, initiating an appropriate local conversation or proposing a capability improvement. It is not restricted to productive work or correcting failures; interest itself can justify bounded exploration within the configured purpose and budget. Specific topic generation/interpretation competence must be evaluated honestly: deterministic routines or the agreed evaluated local interpreter may supply proposals, but ordinary Codex consultation remains conditional.

Continuous availability is not a requirement for endless busy computation, nonstop verbal thought, fabricated experiences or an AI call on every scheduler tick. When novelty or budget is exhausted, retain the disposition and next internal eligibility; do not erase motivation or pretend it is a pending user task. Work/idle intervals are engineering scheduling choices, not claims about human consciousness, meditation or bhavanga. Never describe resource rest as biological fatigue. A new topic must not reset or evade an exhausted task/global budget.

Global background-work budgets, enabled scope, topic novelty, backoff and operator controls govern recurring turns. Select among operator input, existing commitments and self-originated motives in the same attention policy; preserve all other eligible work. Pausing/stopping the agent suspends internal initiative too. A configured profile ambition can seed a candidate motive but cannot automatically become an executable instruction.

### Proactive conversation boundary

First delivery supports Citta-initiated turns in its own local portal inbox. The reason may be a relevant idea, shared interest, question or follow-up, not only a reminder. Contact policy records allowed topics/scope, availability/quiet windows, recent contact, novelty, expiry and rate budget. A closed tab is not proof of availability. An outgoing turn can be persisted for later authorized display; states distinguish created, delivered, seen if observable, answered, deferred and expired. Do not invent acknowledgement.

One unchanged unanswered topic must not repeatedly prompt the operator. Silence is ambiguous, not rejection or permission to escalate. A declined topic/request for quiet updates the relevant contact scope. Citta may return to another thought or activity rather than wait solely for attention. No third-party messaging/notifications or emotional demands are implied by local initiative; those require separately granted capabilities.

### Self-improvement boundary

First delivery can identify an observed gap or potential improvement, inspect permitted information and prepare a proposal with source evidence, expected benefit, risks, measurable criteria and approval state. This includes opportunities noticed through exploration, not only failed tasks. Correcting a sourced memory follows F20; changing runtime code, policy, model, dependencies or deployment is a distinct executable change.

The desire to improve never grants its own workspace, installation, credential, policy or release permissions. Initial implementation stops at a reviewable proposal. A future separately authorized workspace extension may prepare reversible isolated candidates, execute specifically permitted checks and release only with the applicable authorization. Improvement claims require observed evaluation; original engine/profile/policy versions and past traces remain intact. No self-preservation, privilege expansion or unbounded optimization is introduced by naming a motive.


## Agreed model and orchestration boundary

The [technology baseline](architecture.md#agreed-technology-baseline) is accepted. Ollama supplies ordinary local cognitive proposals; Codex remains optional external advice. Both are AI. Track their role, model/version, prompt/schema version, permitted context, response validation, latency and usage separately. A local inference operation does not spend the external-adviser call allowance, but has its own global/task token, latency, concurrency and resource budget. No automatic cloud fallback or unrestricted tool execution is permitted.

Schema-valid JSON is only structural validity. Domain checks must validate references, ownership, uncertainty, eligible actions and consistency with evidence. Inferred topics/appraisals remain inferences; they do not become facts by model assertion. A slow or unavailable local model must not defeat pause/stop controls or deterministic profile/local responses. Results from an obsolete goal/frame version are recorded but cannot overwrite current intent.

Temporal message handlers enqueue observations/controls only; the serial foreground decision loop chooses what to consider. SQL, model inference and abilities are activities. Durable timers drive internal opportunities and recall. Long-running inference/adviser work releases attention according to the interruption policy. Continue/version workflow history with stable domain identifiers and remaining budgets.

PostgreSQL owns domain facts/lineage. Temporal owns execution history and workflow progress. P0 must specify outbox/idempotent delivery, expected domain versions, reconciliation of each journal/database crash window and cancellation semantics. Do not implement both a Temporal owner and a PostgreSQL session-lock foreground owner. Workflow replay uses recorded activity outcomes; domain replay additionally compares application decisions, motives/appraisals and normalized effects with live queues/abilities/inference disabled.
