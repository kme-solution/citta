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

## Temporal and PostgreSQL consistency protocol

**P0 design decision, 2026-11-22:** PostgreSQL owns domain truth and Temporal owns durable orchestration. Use at-least-once delivery with idempotent, version-checked domain operations. There is no distributed transaction and no claim that arbitrary external effects execute exactly once. Implementation and failure-injection validation remain pending.

### Stable identities and ownership

- Workflow ID is stable per agent, for example `citta-agent/<agent-id>`, with conflicting concurrent executions rejected. Continue-As-New retains this identity and the current ownership generation; it must not create a new agent or reset budgets.
- Persist a workflow ownership generation for intentional replacement of a closed/lost execution. An idempotent activation operation advances it once for a new ownership epoch, not for every Activity retry. Old-generation domain commits/dispatch are fenced. Define this replacement protocol before implementing automatic restart/replacement.
- Domain observation, goal/version, frame/version, action and operation IDs remain stable across Activity attempts and workflow-history continuation. Do not derive durable domain deduplication solely from a Temporal Run ID that changes on continuation.
- The workflow is the single deliberation owner. API ingestion, explicit operator controls and adapter results can persist their own input/control/effect records, but cannot independently adopt goals, appraise motives or consume an observation as a decision.
- `domain_version`, `control_version`, goal/frame versions and ownership generation have distinct meanings. Snapshot relevant versions before deliberation; compare them at decision/dispatch commit. Reuse the stored result when an operation ID already committed.

### Ingress and notification

1. Fastify validates the request and its agent/conversation scope. In one PostgreSQL transaction, insert the original observation, unique `(agent_id, source, source_event_key)`, a receipt and a durable outbox wakeup. A duplicate returns the same receipt; a reused key with different content returns a conflict.
2. A committed receipt means accepted/persisted, not considered, acted on or answered. The UI can display it immediately even if Temporal is unavailable.
3. An outbox relay claims a bounded batch with a lease/token, commits that claim, then sends a Temporal Signal outside SQL. A wakeup carries stable event/agent IDs; domain payload stays in scoped storage. The handler only records/coalesces a pending wakeup, not a parallel thought/action.
4. Mark outbox delivery only after Temporal acknowledges acceptance and the relay token is current. A crash after Signal acceptance but before marking delivery leads to a duplicate wakeup, not a second logical action.
5. The workflow drains eligible PostgreSQL observations through an Activity. PostgreSQL consumed/pending state remains authoritative; a notification cache is only an optimization. Fair selection can process observations out of arrival order, so a high-water event cursor cannot silently mark earlier unselected observations consumed.
6. Reconnection/periodic bounded reconciliation can re-wake an agent with old pending input. It does not create a new observation or bypass work budgets. Do not rely on volatile database notification delivery for correctness.

### Context, inference and decision commit

1. A context Activity returns an immutable/sourced snapshot reference and relevant domain/control/goal/frame versions. Store exact retrieved record versions, profile/model/prompt/schema/policy identities, candidate selection factors and budget state for domain replay. Keep large/private payloads out of the orchestration journal when references suffice.
2. Deterministic local routines can propose a sufficient response without inference. A local-model Activity uses a stable inference-request ID scoped to that context and its configuration. It checks for a stored completed outcome before invoking Ollama.
3. Inference occurs outside SQL. Persist its validated output or failure and attempt/usage record before returning a durable reference to the workflow. A unique inference-request record admits one chosen outcome. A crash after generation but before persistence can require recomputation; this is a bounded cost/retry case, not an exactly-once-generation guarantee. Account for attempted work and uncertain usage rather than resetting the budget.
4. When input interrupts or a goal changes, a completed model proposal may be stale. Record its outcome/usage, then compare the referenced frame/goal/control versions; never apply it blindly to current intent. Schema validity is not semantic authority.
5. A `CommitDecision` Activity receives stable operation ID, expected versions, selected observation, context/outcome references, candidate reasons and proposed transition/action. In one transaction validate ownership/scope/versions, record the decision, revise applicable goals/memories/appraisal, consume exactly the selected input, debit applicable budget and queue the action plus committed UI events. No SQL commit executes an external effect.
6. Unique operation/action/consumption keys prevent logical duplicates. If the transaction committed but the Activity acknowledgement was lost, retry returns the committed result. If expected versions changed, return a typed stale-context outcome and reconsider; do not automatically rebase a model proposal onto new context.

### Controls, dispatch and observed effects

- An operator pause/stop/cancel is persisted with a monotonically increasing control version and an outbox wakeup. Revocation is an explicit control path, not a second planner. Every dispatch transaction checks current control, goal/frame version, generation, approval and budget.
- The dispatch transaction claims the stable action and marks its attempt running before the external call. This commit is the dispatch-start boundary. A control committed before that boundary prevents dispatch. A control after it cannot guarantee an already-started effect is undone; report in-flight/cancellation/reconciliation state honestly.
- Execute the adapter outside SQL using the same external idempotency key on permitted retries. Adapter policy declares safe repeat, remote idempotency, reconciliation support or unsafe retry. Never let generic Temporal retries blindly repeat unsafe effects.
- In one result transaction, persist action outcome/attempt, source-attributed effect and stable `(action_id, output_position)` observations plus UI/outbox events. A retry after lost acknowledgement returns the stored outcome. Failed or stale claim tokens cannot finalize another attempt.
- If a process dies after a possibly real external effect but before its result commit, reconcile by external receipt/key where supported. Otherwise mark `unknown` and block redispatch until explicit reconciliation. No automatic successful/failed assumption.
- Result ingestion may record a late output for audit, but only a current foreground decision can review/apply it. A cancelled goal is never revived by a late result. Inference results, Codex speech and local-inbox delivery remain distinguishable.

### Crash-window acceptance matrix

| Crash/conflict point | Durable state and expected recovery |
|---|---|
| API before ingress commit | No accepted receipt; client may retry with the same event key |
| API after commit, before response | Observation/outbox exist; retry returns original receipt |
| Relay before Signal | Lease expires; another relay retries stable event |
| Signal accepted, relay acknowledgement lost | Duplicate wakeup is harmless; pending/consumed domain state governs |
| Context/model result becomes stale during interruption | Preserve attempted work; discard applicability and reconsider current state |
| Model generated, outcome not stored | Bounded explicitly accounted recomputation or unknown/failure; no hidden cost reset |
| Decision transaction committed, Activity reply lost | Operation lookup returns same decision/action; no second consumption |
| Stop races with queued dispatch | Commit ordering at dispatch-start boundary determines prevented versus in-flight |
| External call may have succeeded, result missing | Reconcile or unknown; do not blindly repeat |
| Result committed, Activity reply lost | Return existing action/effect and output keys |
| Old workflow ownership generation completes late | Reject domain mutation/dispatch; retain appropriate stale-attempt audit |
| Continue-As-New / worker restart | Stable agent/domain IDs and stored versions/budgets retained; drain actual pending records |
| PostgreSQL unavailable | No accepted ingress/domain success claim; backoff without external dispatch |
| Temporal unavailable after accepted ingress | Durable pending input remains visible; outbox resumes delivery later |

### Recovery, replay and privacy acceptance

Temporal workflow replay consumes recorded Activity outcomes; it cannot run new inference as a substitute for missing history. Domain scenario replay runs under a separate replay identity using recorded context/clock/proposals/effects, with production queues and live adapters inaccessible. Missing/mismatched versions are explicit unsupported outcomes. Neither replay rewrites the original domain records.

The protocol passes only after failure-injection checks demonstrate one logical decision/action per input, valid fencing, no lost committed inputs, no duplicated non-idempotent effects from blind retries, preserved interruption state/budgets and correct control acknowledgement. Temporal reliability does not automatically prove these application invariants.

References: [Temporal Activity definition and idempotence](https://docs.temporal.io/activity-definition), [Activity lifecycle](https://docs.temporal.io/activities), [TypeScript Workflow messages](https://docs.temporal.io/develop/typescript/workflows/message-passing), [Continue-As-New](https://docs.temporal.io/develop/typescript/workflows/continue-as-new).

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

## Executable local runtime v1

The first implementation uses an additive `citta` schema in a separate local database. Migration bookkeeping stores a SHA-256 checksum and refuses edited applied files. Agent IDs are deployment configuration; conversation IDs and client event keys are UUIDs. Immutable profile hashes identify configured identity versions. The single Temporal workflow ID is `citta/<agentId>`; workflow handlers only wake the loop. SQL operations lock the agent row for atomic ingress/control/decision/dispatch ordering. No SQL lock is held across inference or an ability call.

`GET /api/state?conversationId=<uuid>` returns committed messages, goals, motives, current control, appraisals, proposals and recent events. `POST /api/messages` takes `conversationId`, `messageId`, `text`; idempotent retries return the original observation, conflicting reuse returns 409. `POST /api/control` takes `requestId`, `operation` (`pause`, `resume`, `stop`, `cancel`, `quiet`, `unquiet`), optional `goalId`, and `expectedVersion`. A mismatched control version returns 409. Stop cancels all current commitments and disables initiative until explicit resume; quiet suppresses proactive contact while preserving internal reflection. Pause preserves pending work/results. GET `/api/events` uses Last-Event-ID / `after` only as an event readback cursor, never as an observation-consumption cursor. All endpoints are loopback-only with strict same-origin mutation checks. This is a single-operator local deployment, not a remotely authenticated multi-user service.

The runner selects durable results, operator inputs and eligible internal cues. Pending model/adviser/read operations release the foreground; subsequent local input can be processed while they run. Actions retain their own originating goal/context/profile snapshots. Completion is recorded separately, then reviewed only by the workflow's next serialized decision Activity. Stop/control versions fence dispatch; cancelled goal versions fence late effects. Completed local/HTTP reads are repeat-safe; a claimed adviser with an expired heartbeat is `unknown`, not redispatched. Failed model inference is visible and can be retried explicitly by a new operator request; there is no automatic cloud fallback.

Initial ability scope: local profile/history, explicitly saved conversation notes, bounded regular-file reads beneath `data/fixtures` (symlinks resolved and checked), Ollama structured local proposals, optional explicit or justified Codex advice. Model proposals cannot execute arbitrary commands, change identity, mutate permissions or upgrade code. Adviser output is attributed and unverified unless supported independently; it cannot complete an evidence criterion by its own assertion. Improvement candidates remain persisted proposals. Unsupported free-form tasks clarify or report their limit.

Persistent bootstrap motives are transparently configured defaults: understand permitted sources, reflect on grounded experiences and develop appropriate local connection. An internal turn can choose a fresh topic without a pending goal. Local work is limited by a persisted hourly ledger, per-goal cycle/adviser limits, maximum one inference and one adviser, novelty keys and backoff. Proactive contact is local-inbox-only, limited to one unanswered initiative at a time and a persisted interval/quiet policy. Silence is never treated as consent or rejection. Initial retrieval uses bounded scoped text queries; pgvector is disabled until a meaningful retrieval comparison warrants it.

Local supervision uses a persistent Temporal development service bound to loopback, PostgreSQL, Ollama and supervised Node processes. This is laptop working mode; production Temporal hosting/authentication is a separate operational concern. A private `.env.runtime` can select an isolated database without rewriting `.env`. Runtime commands and exact setup/stop behavior are maintained in operations alongside their implementation. Replay exports stored decision snapshots and validates pure decisions with no live adapter access; Temporal history replay is a separate check.

### Runtime v1 refinements from source implementation

A scheduled `WAIT` retains its original goal/version and a due timestamp. Due recall creates a deduplicated input only for the still-waiting version; cancellation/revision makes old recalls no-ops. Waiting time does not spend the five-minute active-work allowance. Attempts retain actual/uncertain elapsed-work accounting, and an explicit exhausted-goal extension adds capacity without resetting used counts or permitting unknown-effect redispatch. Exact operator reminders can be delivered locally without inference.

A correction identifies a scoped goal/memory version. It preserves the original record, fences obsolete queued/running work, retains previous evidence and revisits the existing commitment. Ambiguous cancellation/revision asks for a target. Clarification waits for operator input instead of falsely completing the original task.

A local inference can yield to a newer operator inference; its context/goal remains durable, uncertain attempted usage is charged, and after three yields it receives protected resumption priority. Global internal work reserves part of the hourly allowance for operator work. New inferred candidate interests are bounded to twelve enabled dispositions and cannot overwrite configured identity/values/defaults or reset the global ledger.

Proactive openings have independent persistent contact records with a stable topic key, reason, expiry and deferred/delivered/seen/answered/declined state. Quiet/unanswered/interval constraints defer delivery; repeated unchanged topic keys do not generate another opening. “Answered” requires an explicit topic reply, not unrelated chat. Declined topics stay suppressed. Contact-policy snapshots and normalized local-inbox effects are exported for offline comparison. No live replay can dispatch speech or consume queues.

Selected model context contains explicit bounded excerpts and is stored with the inference outcome. Record actual model digest, prompt/schema identity, selected-context hash, counts and durations. Appraisals distinguish candidate tendency, adopted tendency and brief regulation reason, with at most three action alternatives. These are inspectable decision summaries, not hidden thought transcripts or proof of experience. Local cognition defaults disabled until evaluation; enabling it is an explicit local configuration step.

### Design-alignment corrections (source only)

F02/F26 require a bounded attention candidate comparison, not just an unrecorded SQL ordering. Record the selection clock, policy, candidate kind/due/arrival factors, selected ID and stable tie-break in each resulting decision snapshot. A due obligation has an explicit persisted due timestamp; after the interruption quota, an eligible continuation receives a turn.

F06/F20 distinguish current input from saved memory even when both are reported speech. Carry an explicit evidence origin. Local recall returns saved reported records, not the current recall request. Before applying asynchronous cognition, recheck referenced saved memories against current scoped validity; superseded evidence invalidates applicability without discarding the recorded model outcome or resetting budgets.

F21/F25 require durable eligibility and causal backoff. Track a motive's last grounded-context signature, unchanged-turn count and next eligible time. The signature uses configured motive/profile and distinct grounded content, not a new timer ID or repeated inferred thought. Unchanged context can still support a fresh topic at a bounded review opportunity; it cannot force an endless repeated action. These refinements use additive migration 004; migration 003 is already applied and remains unchanged.

F05 pause/resume preserves a commitment's pre-pause state and pending-effect checkpoint rather than changing only the agent banner. Pause does not invalidate the version of an already-running effect; results can be recorded but are reviewed only after explicit resume. Cancelled/completed commitments cannot be restored by resume.

F24 improvement proposals carry their specific expected benefit, success criteria, risk/uncertainty and proposed change scope. Operator acceptance/decline is a versioned, idempotent review of that exact proposal, not permission for an execution adapter. The initial registry still has no code/model/policy/deployment mutation capability. Proposals explicitly seeking privilege expansion are declined at the independent boundary.

Replay compares attention policy and contact effects, not merely response text. Contact snapshots include the immutable proposed inbox payload so offline replay can derive the expected delivery effect independently of the stored effect. Missing proof/version data is unsupported rather than silently counted as a match. Inference receives only relevant cognitive context; attention/eligibility audit metadata remains in the durable action snapshot and is restored for review, avoiding consumption of the model's context budget by scheduling traces.

A03/F05 version history remains append-only: goal identity, source, criteria, budgets and state are recorded when a new goal version is created; separate transition entries retain lifecycle changes within that version. Completed/cancelled goals cannot re-enter active states. Each committed consideration also records an agent-local sequence and the actual goal/control/generation state at commit, separately from the earlier model input. The doctrinal catalog is explicitly `not-used` in ordinary runtime decisions rather than implying a fabricated catalog mapping.

F03 bounds suspended nested continuations to four levels. A new long-running task links to its interrupted pending commitment; deeper work remains a durable, temporarily deferred observation rather than being dropped or admitted with a reset budget. Sufficient local responses that finish in the same transaction do not allocate another suspended continuation slot. Exact operator controls remain available through their independent ingress boundary. Pending internally generated candidates are deduplicated before producing another cue.

F20 scoped preferences are explicit operator-sourced conversation records (`response-language`, `response-length`, `explanation-style`). Revising one preserves the prior reported memory and version. Preferences influence future consideration within that conversation; they cannot change configured identity, values, permissions or other conversations. An asynchronous proposal using a superseded preference is reconsidered through the same stale-evidence boundary.

F19 speech rendering includes the chosen decision's explicit uncertainty. Reported external advice cannot lose its unverified attribution merely because it passes through local cognition. This rendering policy is independent of tone and model wording; it does not certify arbitrary generated conclusions or claim a general factual verifier.

Emerging interests retain originating observation/evidence and conversation scope. Configured bootstrap dispositions may be agent-wide; an inferred interest from one conversation cannot supply private content to another conversation's cue or be revised there. Existing inferred interests with unavailable origin/scope are retained but disabled by the additive migration rather than assigned invented provenance.

F15 completion is explicit for model-generated responses: a goal review names the supported criterion, classifies it as met/not_met/unknown, and links evidence. A reply alone does not establish success. Unknown/unmet criteria retain a waiting commitment for evidence or operator input. A generated met claim grounded only in unverified adviser speech is downgraded unless the original operator explicitly requested receiving advice as such. Sufficient deterministic local operations retain their directly observed bounded completion criteria; no general factual verifier is implied.

The planned affect comparison can explicitly disable modeled appraisal with `CITTA_AFFECT_ENABLED=false`. This omits prior appraisals from cognitive context and normalizes recorded agent tone/tendencies to undetermined/hold. Task evidence, user-reported feelings, authorization, controls and all work budgets remain intact. This is a software ablation boundary, not a claim that natural language has no social meaning.
