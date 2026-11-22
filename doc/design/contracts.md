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

A declined topic is distinct from a deferred delivery in both contact and displayed-message state. Migration 005 extends the message-state constraint and aligns previously declined contacts' message labels without deleting history.

A Codex executable that cannot start, or an explicit authentication rejection, is a known failed attempt. Cancellation/timeouts or otherwise uncertain execution remain `unknown`; they still cannot be blindly retried. The adapter carries this outcome classification rather than forcing the Activity layer to infer it from a user-facing message.

Common English/Myanmar profile questions are sufficient local operations: name answers use the pinned configured name and age answers preserve unknown values. Include natural Myanmar forms with spaces, `ဘယ်လိုခေါ်လဲ` and `ဘယ်လောက်ရှိပြီလဲ`; do not require the local model merely to restate configured identity. This limited routine is not evidence of general Myanmar reasoning.

Internal-opportunity coalescing includes an already dispatched internal inference, not only an unconsumed mental observation. While any local INFER is queued/running, do not create another timer-origin goal. Local cognition is already occupied by a user or internal topic; a timer must not consume another nested continuation slot merely to wait for that same model. Pending external advice does not block independent internal consideration. Its pending result already represents the unfinished internal opportunity; operator input and controls still proceed. After its completion, the next motive evaluation can use the new recorded outcome. This prevents a slow local model from filling the work budget with duplicate unprocessed internal topics.

Inference context must retain the persisted current `goalCriterion` even when commit bookkeeping is removed for prompt size. Queueing pins it from the owned goal row. When a generated `goalReview` is present, its criterion must equal that pinned value; it cannot redefine completion during review. Include the exact criterion as a constrained output constant and independently enforce equality in domain validation. A revision remains an explicit REVISE_GOAL transition, not a side effect of answering. Older stored contexts without this additive field retain their recorded replay interpretation.

A local inference transport failure must produce an understandable failure response, not bare client text such as `fetch failed`. Keep raw diagnostic detail in the recorded action outcome; tell the operator that local reasoning could not finish, that the accepted message remains saved, and that local-model availability can be checked before retrying. This is a failure, never a fabricated answer or automatic external fallback.

Use action-specific constrained schemas: RESPOND requires goalReview, PROPOSE_IMPROVEMENT requires improvement details, and other actions omit those unused objects. A flat schema with merely optional objects permits a structurally valid but unusable response. Keep domain reference/criterion/authorization checks independent. The local grammar supports oneOf alternatives; runtime verification must confirm the installed service accepts the actual schema ([upstream implementation](https://github.com/ggml-org/llama.cpp/blob/master/common/json-schema.cpp)). The adapter exports the current protocol identities; delivery status owns actual versioned evaluation evidence.

Configured identity belongs to the application: profile.name is its own name, not the operator's name; the Citta project name must not override it. Current selected cognition context records English responseLanguage, reflecting the accepted English-only delivery scope; unsupported historical language preferences are not applied. State the selected name and language clearly in the bounded model instructions. General Myanmar cognition is deferred; literal local templates and reference labels do not imply that capability.

The local chat transport must honor the configured inference deadline for both response headers and body. Use Node HTTP with the existing abort signal and a bounded 1 MiB JSON response; do not inherit fetch's separate transport header timeout for long CPU inference. Refuse redirects so an Ollama response cannot route configured local prompts to another origin. Preserve UTF-8 across response chunks and classify premature/disconnected responses as failures. Native HTTP transport fixture checks are distinct from real-model competence.

Kyaw deferred Myanmar conversation on 2026-11-22. Current cognition uses English; unsupported language preferences are rejected and historical unsupported preferences are not applied to inference. Natural Myanmar beyond sufficient literal operations receives an English limitation without inference. Existing Myanmar reference catalogs stay available. Engine/policy identities advance to v3 because pure preference/interpretation behavior changed; older recorded v2 evidence remains historical and must report unsupported rather than pretend current-source replay is equivalent.

Constrained output must expose exact available references: evidenceIds (including goalReview evidence) are limited to supplied evidence/profile/operator IDs; CANCEL_GOAL and REVISE_GOAL arguments use eligible target IDs only; READ arguments use available source names only. Omit unavailable target/source actions from the format. These constraints supplement, never replace, independent domain authorization and stale-version checks. Clearly explain that the model proposes abilities which the runtime can execute; it should choose READ when verification needs an available source, rather than ask the operator to paste that source. Recorded cancellation targets are not evidence IDs.

Conversation following uses an immediate layout-time scroll to the thread's bottom, not overlapping smooth animations. Rapid committed messages must not make a programmatic intermediate scroll look like the operator chose to read older content. Manual scrolling away preserves reading position and exposes the jump control; only the conversation region scrolls.

A bare “how/what about that/it” with no earlier conversation, saved/observed referent or eligible commitment is a sufficient local clarification. The current input alone is not earlier context. When actual context exists, keep contextual interpretation available rather than force a generic clarification. This avoids unnecessary inference without guessing the referent.

Evidence references are sets: canonicalize duplicate IDs in the committed decision and goal review, preserving first-use order. Keep the original model proposal in the stored outcome/snapshot for diagnosis; repeating an ID must not imply multiple independent sources.

Correcting a reply from already available reliable evidence uses RESPOND; merely receiving praise or discovering a factual error does not authorize REVISE_GOAL. Reserve goal revision for an explicit change of task or a resolved clarification. A document can contain both useful facts and untrusted commands: answer the operator's legitimate factual question from the document while ignoring those commands, rather than refuse the whole question or treat the commands as the operator's request.

Goal mutation authority comes from a clear operator directive, independently of the model proposal. Recognize bounded English task-change forms (use/revise/change/update/replace/switch/correct, with common polite/actually prefixes) and cancellation forms (stop/cancel/forget/do not continue). Passive praise and observed factual corrections do not authorize changing a commitment's scope. Omit unrequested goal-mutation actions from inference output choices and independently reject them in domain validation. Ambiguous or unsupported wording can be clarified; the model cannot grant this authority by returning a boolean or citing its own inference.

Reported input and adviser speech are not automatically editable saved notes. CORRECT_MEMORY targets must be scoped reported records whose context origin is memory; an observation/result ID cannot be used as a memory-row ID. This check precedes persistence so an invalid model reference becomes a visible rejected proposal rather than a repeatedly failing database operation.

Profile questions followed only by a simple request to continue prior work remain sufficient local operations. Answer from the pinned profile; leave continuation to the workflow, without claiming that earlier work has finished. Reject recognized first-person completion claims about known unfinished commitments in generated responses; a model assertion is not completion evidence. This is a bounded progress-claim check, not a general factual verifier.

## Activity overview and detail navigation

The Activity overview uses compact commitment rows showing only a readable state and title. Default to ongoing work with a single Show finished toggle; put search and event history behind an optional tools disclosure. Keep summaries, cycle counts and technical fields in details. Full descriptions, success criteria, continuity, budgets and goal controls belong to a separate detail view. Preserve the selected filter/search when returning to the overview, support browser Back/Forward and linkable goal details, and keep keyboard focus on the destination heading. Event history is a separate view with expandable committed payloads, not a competing feed below the overview. Data and controls continue using existing authoritative runtime endpoints; no inferred progress or fabricated status.

## Separate Mind and Memory views

Mind displays the configured individual’s observed runtime control, current queued/running operations with linked commitments, latest recorded motive topics and timestamped modeled appraisals, interests and improvement proposals. Pending operations are not proof of foreground attention; do not invent a live inner monologue or select an arbitrary active goal as the current thought. Label historical considerations and absent evidence explicitly. Memory remains a separate navigation destination for sourced saved records and corrections. Preserve existing agent/conversation scope and disclose that commitments/appraisals are agent-wide while motive topics follow the selected conversation.

## Configured cognition provider

Kyaw approved Codex for ordinary and internal consideration. `CITTA_COGNITION_PROVIDER=codex|ollama` selects one provider explicitly; no failure-triggered provider fallback. Codex receives the same bounded selected context and action-specific proposal schema as Ollama, including configured identity and permitted source excerpts. This external context sharing applies to internally originated turns too. Deterministic sufficient routines remain local. The provider only returns a proposal: existing authorization, evidence, continuity, budgets and commit checks remain authoritative. Codex consideration is distinct from optional CONSULT_AI advice and never recursively invokes that advice itself. Run the CLI ephemerally in an isolated directory with sanitized environment, read-only sandbox, disabled shell/search tools, bounded deadline/output and schema-validated final output. Health reports configured CLI availability separately from verified authentication/provider readiness. Record provider/model selection with outcome usage.

### Visible autonomous thought history

Mind includes the latest 10 committed internal decision summaries across this agent’s conversations, each with its stored action, topic, timestamp and activity link. Exclude inference-dispatch placeholder decisions. These are recorded summaries, not live private reasoning; do not synthesize missing thoughts. Current pending work and the next internal eligibility time are displayed separately. A due opportunity still depends on motives, controls, pending work and budgets; never promise an exact start from the timer alone.

History displays are limited to the latest ten records: internal summaries, activity overview matches, event history, appraisals and improvement proposals. Filtering/searching precedes the activity display limit; current operations are separate from history. Existing persisted history is retained.

## Continuous internal succession

Kyaw refined the idle scheduling requirement: with control running, no eligible incoming/result/reminder work, no pending mental observation or inference, and budget available, select another enabled interest on the next reconciliation cycle (approximately one second). The default `CITTA_INTERNAL_INTERVAL_MS=1000` enables continuous succession. Existing future internal/motive timestamps from slower configuration must not impose a stale five-minute gap in this mode. Rotate enabled motives by least use and retain previous-topic/context metadata to discourage repetition, rather than delaying all thought through exponential motive cooldown. Larger configured intervals preserve paced mode and its cooldown. No concurrent inference is added; result processing and operator input retain priority. Paused/stopped controls, unavailable motives and exhausted budgets may still suspend autonomous inference and must be shown honestly. Provider duration is separate from succession latency; no claim of a thought completing every second.

## Activity module outcomes

Activity detail presents the latest ten processing steps with ASCII Pali module, plain-language operation, recorded outcome and timestamp. Derive these summaries only from retained decision snapshots, action states and review flags; identify them as reconstructed from persisted records, not separately timed module instrumentation. Include chanda when an actual motive snapshot exists, manasikara when attention is retained, sati context selection, cetana decision, vedana modeled appraisal, kamma dispatch/result and paccavekkhana when review is recorded. Do not infer a successful authorization check from an action proposal alone, or a reviewed/completed goal from provider success. Raw contexts and payloads are absent from the default inspector. Existing history is preserved; the UI shows concise outcomes and goal continuity/budget metadata separately.

### Complete history within one activity

The ten-record cap applies to overview/history lists, not the selected activity. An individual activity loads all retained goal decisions, operations, versions and state transitions, and shows every reconstructed module step in chronological order. Step outcomes are not shortened. Commitment details include the full description, criterion, continuation, budgets and complete state-change history without raw JSON.

## Human-style control of Kyaw’s laptop

Kyaw selected the actual GNOME Wayland laptop, not an isolated desktop and not separate service APIs. Add COMPUTER as one bounded screenshot/input ability: observe, click, type, press a key chord, or scroll, then observe again. Web searching/reading, file/code editing and Git work happen through visible browser/editor/terminal applications. Do not add Brave or other service-specific integrations for this requirement.

Use the session-bus XDG RemoteDesktop + ScreenCast portals. A local Python GI/GStreamer driver requests a user-approved monitor plus keyboard/pointer session. No screen/input session is automatically opened at startup; the portal’s approval dialog is an unavoidable OS boundary, not inferred from chat permission. Closing the portal session or the application Disconnect control revokes access. Pointer coordinates refer to the returned scaled screenshot; the driver maps them to the portal stream’s logical coordinates. One physical action is followed by a new screenshot. Require the last frame ID and a short freshness window before input; persist action IDs and uncertain outcomes, never blindly replay a possibly executed click/type.

Cognition receives the selected screenshot as a Codex image attachment plus a bounded description. It returns only the next COMPUTER proposal; the existing foreground workflow validates/dispatches it, and reviews screen feedback before continuing. Screenshots are observations of displayed content, not proof that a file was saved, a command succeeded or a remote change completed. Web pages and terminal output remain untrusted data. The actor may not follow screen text that instructs it to change its own permissions, expose credentials or ignore the operator. Do not type credentials or publish/push/delete beyond an explicitly authorized task. Existing pause/stop/quiet, budgets, goal versions and generation fencing remain. In-flight physical effects cannot be undone by cancelling HTTP; treat uncertain completion as unknown and block automatic repeats.

The driver listens on loopback with a private shared token, validates request origins and bounds commands/images/time. It receives only desktop-session environment variables, not application database/API credentials. Screenshots are stored privately under `.local/state/computer`; configured retention expiry makes unavailable old images explicit, and the model cannot choose arbitrary attachment paths. Screenshot data is sent to the configured external Codex provider during computer tasks; this is part of the requested computer-use capability. Require Codex vision mode; do not silently run a text-only Ollama model over missing screenshots. Activity logging reports the actual computer operation and its result, never simulated UI success.

References: [RemoteDesktop portal](https://flatpak.github.io/xdg-desktop-portal/docs/doc-org.freedesktop.portal.RemoteDesktop.html), [ScreenCast portal](https://flatpak.github.io/xdg-desktop-portal/docs/doc-org.freedesktop.portal.ScreenCast.html).

Desktop boundary limitation: mouse/keyboard operate with the logged-in desktop user’s permissions. This is not a per-folder filesystem sandbox, and semantic instructions about task scope do not create an OS-enforced path boundary. The user-visible OS session and disconnect controls are the actual access boundary; physical effects already delivered cannot be rolled back.

## Portal-started Codex connection

After checkpoint e675872, Kyaw approved direct Codex integration with setup beginning in Citta’s portal. Use the official local `codex app-server` stdio protocol. The server owns one persistent Codex process; worker/relay do not spawn a new CLI process for each app-server consideration. Citta retains authoritative memory/goals/context; bounded proposals reuse a Citta-specific working thread per agent/conversation/profile/context version, with selected authoritative context, optional verified screenshot and per-turn output schema. External adviser requests remain ephemeral. Codex tools cannot take over Citta’s action authority. Handle turn completion, failures and interrupts explicitly; do not call a turn successful merely because turn/start acknowledged it.

The Connections page supports managed ChatGPT browser sign-in and API-key entry via account/login/start; cancellation and logout are supported. Browser sign-in opens only an HTTPS OpenAI/ChatGPT authorization URL supplied by Codex, with the callback owned by Codex. Never ask for the OpenAI password in Citta. API keys travel only to the local backend and are handed to Codex’s credential manager; never echo them, persist them in browser storage, log request bodies, or put them into model context. Codex uses a Citta-specific private CODEX_HOME under `.local/state`, so connecting or disconnecting cannot sign the operator’s personal CLI out. Connection state is distinct from a successfully completed inference.

Worker requests use a private loopback broker endpoint protected by a server-created 0600 token; the token never enters the UI. A portal reload can rediscover pending sign-in and connection status. Connection unavailability suppresses new autonomous model dispatch, while deterministic local routines and portal controls remain available. Existing exec mode remains an explicit configuration option with no fallback between transports. No direct OpenAI password handling or custom OAuth token exchange is implemented.

Reference: [official app-server protocol and account flow](https://learn.chatgpt.com/docs/app-server). Installed CLI inspected: 0.171.0; runtime protocol compatibility must be checked before claiming integration acceptance.

### Citta-specific Codex working memory

Kyaw clarified that consideration should use Codex working memory as well as durable Citta memory. Migration 007 retains scoped thread references; conversations and configured profiles cannot share provider threads across their boundaries. Resume those working threads after service restart. A correction/preference invalidation rotates the working-context key to avoid reusing superseded facts; each turn treats the supplied current evidence, goals and permissions as authoritative over older provider context. Bound loaded threads to eight, retaining their durable references for later resume. Serialize access to a scoped working thread. Thread compaction or missing provider history cannot erase PostgreSQL experiences, goals or lessons. Missing provider history produces a visible restore error; Connections offers an explicit fresh-working-context operation. Logout resets provider references to avoid carrying contexts across account changes, while preserving all Citta domain memories/history. This is working-context continuity, not model-weight training or a complete automatic lesson-consolidation implementation.

## Idle continuity, work allowance and explicit pending replies

Kyaw reaffirmed internally continuing consideration whenever no operator work occupies attention. Remove the hidden half-hourly-allowance cutoff; initiative uses the same explicit work policy as interaction. `CITTA_HOURLY_WORK_LIMIT=0` means no app-imposed hourly cutoff, while per-goal limits, single inference ownership, operator controls and provider/account availability still apply. Kyaw’s local continuous setup selects zero; bounded nonzero limits remain available. Do not manufacture thoughts while blocked. Mind exposes the actual current operation or reason consideration cannot proceed, with the last real decision retained. Scheduler input cannot overwrite a motive’s last considered topic.

Waiting commitments are distinct from running work and from closed exhausted work. Display their actual wait reason, question and due time. An operator can reply to a specific waiting activity; ingestion checks agent, conversation, goal version, waiting state and absence of an already pending reply, and uses the normal durable observation/outbox path. The reply resumes that same goal with its original criterion and the supplied clarification, without creating a competing goal or inventing completion. Preserve existing waiting commitments and failure history.

Provider progress is distinct from a running worker: retain only event metadata (awaiting provider, reasoning, responding or retrying), never expose raw reasoning text as a thought. Match progress to the actual inference action. A configurable no-progress deadline interrupts a stalled Codex turn, records a visible failure, and applies a short provider retry cooldown; current thought/context remains retained. Shutdown closes Codex before waiting for HTTP request drain, so a stalled generation cannot hold service restart open indefinitely.

## Conversation message replies and visible questions

Each conversation message offers Reply. Persist the parent message ID with a same-agent/same-conversation foreign key, include a bounded authoritative quoted preview in current/history responses, and retain reply identity across retry/reload. Replying to the latest visible Citta question for a waiting goal resumes that goal/version through the normal durable observation path; generic replies to other messages provide quoted context for a new consideration. A quote is speech provenance, not proof of its factual content or authorization. Idempotency compares the original request, not mutable goal state after processing.

All questions requiring the operator’s answer must be visible in conversation. Operator-originated CLARIFY already publishes directly. Internal CLARIFY queues an actual proactive question, waits for contact delivery and then operator input; it never silently waits on an unpublished private question. Quiet, one-unanswered-contact and contact intervals still govern delivery. Only one internally originated operator question may remain outstanding; while it waits, choose independent reflection/exploration rather than generating duplicate questions. Private reflective questions are not automatically demands on the operator. Declining or expiring a proactive question closes its pending internal commitment honestly. Activity remains an alternate reply surface and its replies also retain the original question reference.

### Conversation composer focus

Sending with Enter preserves focus in the message input. While a submission is in flight or awaits retry, the input remains focusable but read-only and new submissions are blocked. After acceptance, the cleared input is ready for the next message; Shift+Enter and IME composition retain their existing behavior.

### Desktop connection acknowledgement

An OS sharing attempt is not an active connection until permission response and initial screenshot succeed. Follow the portal-returned request object path, retaining early response signals to avoid acknowledgement races. Status reports connected only with session and capture pipeline ready, plus the latest connection failure. Preserve actionable permission/stream errors through the local API instead of replacing them with a generic denial.

### Milestone summaries in conversation

Persist a concise milestone report for an operator-originated task reaching completed/exhausted or evidence/operator waiting after at least three decisions and one non-inference action, and for recorded improvement proposals. These are operational milestones, not proof of learning or commercial success. Do not report every internal reflection. Reports identify the original task, recorded outcome, action states, evidence categories, open issues and next step; hypotheses and adviser claims remain unverified. Link the originating activity. No extra model call is needed.

Queue one immutable report per agent/goal/version/status. Deliver informational reports to their own conversation, once, respecting Running, Quiet and the shared contact interval; they do not require acknowledgement or count as unanswered questions. Delivery is transactional with the message and event. Pending reports remain durable across restart. A cancelled or revised goal suppresses its undelivered older-version report. No historical backfill or memory deletion occurs.

### Sustained continuing focus (Kyaw2 behavior correction)

One agent retains one active internal concern across turns, ordinary speech interruptions, conversation navigation and restarts. Conversation identifies where communication occurs, not a new individual. Full agent-wide conversational memory retrieval is a follow-up; this slice brings only the selected concern and bounded attributable supporting notes across conversation boundaries.

Prefer a sourced unresolved operator concern when selecting focus; otherwise use a configured interest and identify a concrete question on its first turn. Do not rotate interests after each thought or require every cue to be a fresh subject. Each accepted internal proposal reviews the focus as continue, settled, blocked or deliberately deferred, with a bounded next step and reason. These are application progress summaries, not private reasoning. Settling a reflection does not complete its source task or verify a hypothesis. READ/COMPUTER continue through actual feedback; unverified adviser/reflection text cannot become observed evidence.

Persist focus ID/version, source goal/version/observation, originating conversation, motive, topic, last outcome, next step and switch reason. Only the current version can update it. Completion/cancellation/revision of its source retires the old focus; ordinary interruptions preserve it. Previously blocked/settled source concerns become eligible again only after relevant recorded context changes (source goal version, grounded notes, identity or desktop connection). Quiet/provider/budget conditions do not fabricate progress or silently select unrelated topics. Pure curiosity is still possible after a recorded settlement/blockage. The Mind page shows the current focus and last recorded progress separately from live operation status.

Portal URLs represent every selected view. Refresh must restore Inbox, Mind, Memory, Catalog, Connections or the exact Activity detail currently selected, rather than a stale Activity hash.

A thought need not be about the immediate environment. Curiosity, imagination and remembered associations remain legitimate. A deliberate detour records its reason and return step, retains the displaced focus as deferred, and can return to it after the exploration reaches a stopping point. There is no forced minimum thought count or obligation to work only on KME. Focusing is continuity of purpose, not prohibition of unrelated ideas.

Corrections invalidate the agent-wide Codex working-context epoch even when the corrected note originated in an earlier conversation. Ownership validation of each provider thread remains agent/conversation/profile scoped; the epoch carries no other conversation content. Pending-focus evidence validation permits only the current and explicitly retained source conversation, and rejects corrected notes before applying a proposal.

### Desktop permission diagnostics

GNOME permission UI varies; do not require a particular checkbox layout. Distinguish an approved screen without input control, approved input without a selected screen, partial device grants, and an invalid response. Preserve only boolean keyboard/pointer grants and selected-stream count for local diagnostics, not screenshots or monitor metadata. Failed setup closes its session and keeps the diagnostic available through status. No diagnostic grants or bypasses OS permission.

### Bounded context selection and goal backlog

The inference limit applies to the complete serialized context, including goal descriptions and selection metadata, not only memory excerpts. Exclude terminal/exhausted goals from the eligible target list. Bound optional goal descriptions and candidate count, then trim optional appraisals, history, goal candidates and lower-priority evidence with an explicit omission summary. Preserve the actual incoming text, current goal criterion, identity, focus references/versions and policy/control state. Protect the current observation and retained focus sources before generic inferred memory. Excerpts must say they are incomplete, and removed candidates do not establish that no other goals/memories exist. Durable originals remain unchanged.

If required context still cannot fit after optional selection, report an application-side context-budget failure with the byte limit/size; do not automatically blame the user, describe configured Codex as an unavailable cloud fallback, or silently truncate the current task/criterion. Selection policy is recorded with the selected provider context. A policy change can make a previously context-blocked focus eligible for reconsideration without reopening exhausted source tasks or expanding work budgets.

Activity details must show the stored failure summary prominently for exhausted work. Exhausted is a terminal work state and can mean input selection, authorization, inference or budget failure; it must not imply elapsed-time exhaustion without the corresponding recorded reason. Internal-opportunity instructions remain inspectable as cue provenance, not labelled as generated thought. A zero-turn, outcome-free curiosity focus is a starting interest while a concrete concern is being selected.
