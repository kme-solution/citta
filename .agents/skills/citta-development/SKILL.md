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

### Deep module correction and current source-only boundary

Kyaw requires detailed module-by-module research rather than shallow operational alignment. Derive missing behavioral requirements from authoritative sources without waiting for a complete user requirements document. Distinguish canonical discourses, later Theravada explanations and engineering interpretations. Document the module contract before source changes. A Pali label, object identifier or successful infrastructure test does not establish doctrinal fidelity or useful behavior.

Kyaw authorizes replacing/removing incorrect earlier implementation; preserve user data, identity, private configuration and applied migrations. Git preserves source history. Start with one coherent module slice, keeping semantic acceptance gates explicit. Under nearest AGENTS.md, this new ordinary implementation slice is source-only: do not run application code, tests, builds, type checks, migrations or services unless Kyaw explicitly requests execution again. Prior delivery verification does not verify subsequent source changes.

### Three documents per module, one module at a time

Kyaw requires three separate documents for each reviewed module: (1) the Buddhist explanation with attributed sources and distinctions between discourses and later explanations; (2) how that concept is modeled digitally, including interpretation limits and behavioral requirements; (3) the coding/implementation design, integration and acceptance gates. Work through modules one at a time, beginning with cetana in the current review. Do not expand into simultaneous module redesign. Use `doc/design/modules/<pali-name>/01-buddhist-explanation.md`, `02-digital-model.md`, and `03-implementation.md`. Kyaw confirmed that the first document is written in Myanmar, with Pali terms and source references; the other two remain English. All 16 existing module folders plus the missing phassa/sanna/pannatti boundaries now have these three documents (57 files), indexed in doc/README.md. The combined cetana/manasikara documents were removed. Keep each module owner current rather than recreating combined plans.

### Structural review after documentation

Kyaw requires checking whether actual modules and services are correctly structured after completing the module documentation. Compare real code ownership, imports/callers, domain/infrastructure boundaries, persistence and integration responsibilities with the completed contracts. Identify duplicated legacy paths and missing mechanisms, with concrete keep/move/merge/retire/replace decisions. Document the review in existing delivery status; do not treat filenames as proof of alignment or silently restructure source during documentation work.

### All-module documentation and structure baseline

The three-document inventory is prepared for all current module folders and the three missing boundaries. The read-only structural review is recorded in doc/delivery/status.md, including misplaced speech/Codex transport, mixed cycle/repository/focus ownership, absent intention/encounter/recognition mechanisms, limited consequence review and legacy/reference separation. Follow its safe correction order one coherent source slice at a time. Documentation completeness is not implementation completeness or expert doctrine/translation approval. No application code or services were changed by that documentation/review task.

### Concept coverage precedes module introduction

Kyaw clarified on 2026-11-23 that existing-folder coverage is not complete conceptual coverage. Eight additional three-document sets cover citta/vinnana integration, vitakka, vicara, adhimokkha, viriya, ekaggata, panna and nivarana. All current catalog factors have explicit design dispositions in doc/reference/model.md, including reference-only and unresearched analogues. Do not claim exhaustive Buddhist coverage or introduce one service for every factor. Follow doc/design/contracts.md ownership decisions: shared consideration/adoption envelope, optional applicable facets, pure policies, one serialized owner. Document first, then introduce a source module only with a real integration consumer and version/replay compatibility; no empty/disconnected scaffolding or new deployed service is justified by a Pali name.

### Explicit operating hold after ineffective token consumption

On 2026-11-23 Kyaw requested stopping services because autonomous Codex calls consumed tokens without effective progress. Citta processes, Temporal and its Ollama container were stopped; private runtime cognition was disabled. Do not restart or re-enable autonomous cognition without Kyaw's explicit instruction. Prior continuous-mode operation permission is superseded by this hold. Preserve the long-term independent-initiative design requirement while adding meaningful spend/progress controls before activation; do not invent billing totals or claim past usage was cancelled.

### Sequential development, product usefulness and terminal client

Kyaw requested continued development one slice at a time against the module documents and wants a useful app that may become a commercial product. Do not confuse source/document completeness with behavioral or sale readiness. Finish a coherent integration before expanding into other modules; preserve the stopped-services/cognition hold. Current slices separate configured interests/ambitions and provide a terminal chat client with top-of-screen recorded Mind/thought status. Terminal chat uses the existing API and shared public read contracts; status refresh never triggers inference. Shell command execution is a distinct unresolved capability, not permission to execute terminal chat text. Resource work units are not billed tokens, and configured success criteria are not achieved progress.

### Authorized rebuild/startup with cognition held off

Kyaw subsequently requested rebuilding and running the local application. That authorizes the corresponding build/focused checks and local stack startup, not re-enabling autonomous cognition. The rebuild/startup milestone in doc/delivery/status.md owns actual verification and limits. CITTA_COGNITION_ENABLED=false remains in the private runtime override. Future ordinary implementation remains source-only unless explicitly authorized; do not infer another restart or paid inference from completing source.

### Explicit cognition reactivation

On 2026-11-23 Kyaw explicitly requested enabling cognition after explanation that both conversational and autonomous Codex usage resume. The private runtime override was enabled and supervised services restarted. This later instruction supersedes the earlier cognition operating hold; preserve current controls and accurately report that separate conversational/autonomous spend limits remain unfinished. It does not authorize unrelated deployments, pushes or unlimited verification calls.

### Latest application stop

Kyaw subsequently requested stopping the application while considering existing background coding products, then requested commit/push. Citta application processes are stopped; preserve that state. The commit/push request does not authorize starting services, paid inference, applying pending migration 013 or running application checks. Earlier cognition enablement remains a configuration fact, not permission to restart after this later stop.
