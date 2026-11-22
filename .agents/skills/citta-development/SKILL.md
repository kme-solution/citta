---
name: citta-development
description: Implement and maintain the Citta application in this repository using its approved continuing-agent architecture, behavior scenarios, and Kyaw's development preferences. Use for Citta implementation, integration, local setup, and delivery work.
---

# Citta development

## User intent

Deliver the complete working application with real persistence, real integrations and the approved flows. Do not stop at a plan, disconnected UI, simulated runtime, hardcoded successful effects or an automatic Codex chatbot. Tests may use fixtures; the application must use actual configured services and observed outcomes.

Citta is an ongoing individual application with its own configured identity, memory, interests, desires, ambitions and contextual modeled feeling. It can originate fresh thought/activity when nobody is speaking and no work is pending. It can choose to speak in its local inbox, reflect, explore permitted sources and prepare improvement proposals. One foreground stream considers one thing at a time; new input can interrupt, receive a response and permit previous work to continue. Background effects can remain pending without owning deliberation. Do not claim literal consciousness or human feelings.

The design follows the approved Buddha/Abhidhamma-inspired architecture and flows. Engineering cycles are not literal doctrinal mind moments. Preserve doctrinal catalogs separately, including English/Myanmar descriptions and explicit pending terminology review.

Current approved reasoning uses sufficient local routines or Codex App Server, including internally initiated consideration. Citta owns durable PostgreSQL memory/goals and isolated per-conversation/profile Codex working threads; personal Codex/ChatGPT history is not Citta memory. Ollama remains an explicit offline alternative, with no automatic provider fallback. Optional external adviser speech remains attributable and unverified. Portal Connections owns supported ChatGPT sign-in or API-key setup; never collect OpenAI passwords in Citta.

## Sources of truth

Start at `doc/README.md`. Read only relevant sections, expanding when needed:

- `doc/product/requirements.md`: agreed REQ-01 through REQ-18.
- `doc/design/architecture.md`: accepted A01-A10 and technology choices.
- `doc/design/behavior-flows.md`: F01-F26, S01-S60, W01-W06.
- `doc/design/contracts.md`: state, consistency, authorization, integration and API boundaries.
- `doc/delivery/plan.md`: P0-P6 implementation packages/dependencies/gates.
- `doc/delivery/status.md`: sole progress/evidence record and safe resumption point.
- `doc/operations/local.md`: actual operating commands and prototype/target distinctions.
- `doc/design/model-evaluation.md`: laptop/model assessment and language evidence.

Write product/architecture/operating changes in `doc/` before affected code. Update existing owners instead of adding competing plans or legacy runbooks. Keep stable requirement/diagram/scenario IDs. ASCII Pali names identify domain modules/services.

## Agreed implementation constraints

Use TypeScript/Node, Fastify, React/Vite, Temporal, PostgreSQL and Codex App Server as currently approved; Ollama remains optional. Human-style desktop use targets the actual GNOME Wayland laptop through an OS-approved Python GI/GStreamer screen/input driver, not service-specific search/Git APIs. PostgreSQL owns domain truth; one stable Temporal workflow per agent owns deliberation. Activities perform SQL/network/model/ability work. Persist observations, source/version lineage, decisions, goals, continuations, appraisals, actions, results and contact/budget state. Use durable outbox, stable operation IDs, version/generation fencing and explicit unknown-effect handling. Continue eligible internally motivated consideration when idle, without an artificial five-minute gap or hidden half-work-budget cutoff. Local continuous mode uses work limit 0; per-goal/provider limits and Pause/Stop still apply. Show actual current operation or blockage, retain real thought history, and never manufacture filler thoughts or equate a CPU tick with bhavanga. Keep controls responsive during inference/advice. No cloud fallback, arbitrary model-generated commands or executable self-upgrades.

Preserve existing `.env`, identity attributes, notes/history, applied migrations and catalogs. Unknown profile fields remain unknown. Secrets never enter public configuration or prompts. Kyaw explicitly deferred Myanmar conversation on 2026-11-22 and accepted English models. The local model must handle evaluated English scenarios; Myanmar catalogs and literal commands remain, with general Myanmar cognition outside the current delivery gate. Valid JSON alone is insufficient. Retrieval uses bounded scoped evidence; enable pgvector only if justified by evaluation. Hardware is a 4-core/8-thread i7-8650U, about 32 GB RAM, Intel UHD620, CPU inference initially; do not assume a dedicated GPU or measured model quality.

The portal must preserve Enter to send, Shift+Enter for a newline, IME composition, a stationary inbox/composer with independently scrolling conversation and automatic scroll for new turns. Show committed state, receipts distinct from answers, pending/suspended work, honest failures and actual controls. Reload/reconnect uses durable history.

## Authorization and current execution preference

Kyaw granted broad permission on 2026-11-22 to develop the complete application independently, including necessary local dependencies/setup and eventual integration verification. Continue without repeatedly asking for routine technical choices; ask only for a material unresolved product decision or concrete external blocker.

**Current execution preference:** Kyaw explicitly authorized testing and verification after commit 28971bc. For this session, run appropriate local type/build/domain/integration/model/browser checks, apply necessary isolated test/development migrations and start required services. Fix failures and preserve existing data/private configuration. This supersedes the earlier code-only hold; it does not authorize a new push or production deployment. Record actual results in the existing status document.

Broad permission does not require publishing, deploying to production, deleting data or pushing branches. Prior pushes to main applied to earlier specific requests; do not infer a new push request. Do not create third-party messages. The app's improvement motive does not grant the running app code-release or credential rights.

## Completion and continuity

Progress through coherent end-to-end packages; preserve completed work across sessions. Record changed boundaries, remaining tasks, actual verification and exact next step in `doc/delivery/status.md` at meaningful milestones. Avoid repeated repository-wide investigation or process-heavy audits. Explain real limits plainly. A final working-mode claim requires observed end-to-end results after implementation, including recovery/control and language behavior; source completion alone is `implemented_unverified`.

### Explicit correction after premature verification

Kyaw objected when verification began after a first source pass: “hmm, you are running tests”. Do **not** interpret a source milestone as permission to begin verification. Continue code-only until Kyaw explicitly requests execution. No tests, builds, type checks, migrations, service starts or model benchmarks. Source reading/writing and stopping agent-started processes are allowed. This historical correction was later superseded by Kyaw's explicit post-commit request to test and verify, recorded above.

### Milestone communication

Kyaw can miss individual suggestions in the thought stream. Deliver durable conversation summaries for substantial completed/blocked work and recorded improvement proposals, with outcome, evidence/uncertainty, open issues, next step and activity link. Preserve Quiet/contact pacing and distinguish self-generated suggestions from operator-approved priorities. Do not treat silence as approval or report each idle thought as a milestone.

### Continuing focus and free thought

Kyaw clarified that conversations are communication contexts for one continuing individual, not separate memories/personas. Fix scattered attention first, then complete shared-memory retrieval. Retain one concern, its outcome/next step and source across turns, interruptions and conversation changes. New ideas can be unrelated to the immediate environment: preserve curiosity, imagination and memory associations. A deliberate detour records its reason and return point; do not force work-only/KME-only attention or manufacture continuous filler. Portal refresh must preserve the selected view, not return to stale Activity.

### Dashboard and delivery communication

Kyaw requested a dashboard where Kyaw2 can report back when he wants to say something. Use actual published initiatives, questions and milestone records across conversations, with ten-row pages, source conversation/activity links and the existing quoted Reply path. Show queued contact separately as undelivered; do not fabricate messages or bypass Quiet/contact controls. Source formatting belongs in a separate mechanical commit; applied migration contents are checksum-pinned. After dashboard/formatting/restart, review modules and services one by one and record concrete defects separately from optional improvements in the existing delivery document.
