# Current status and next safe task

**Updated:** 2026-11-22. This is the single implementation/verification record. Scope comes from [requirements](../product/requirements.md), [architecture](../design/architecture.md), [flows](../design/behavior-flows.md) and [delivery gates](plan.md).

## Current scope and authority

- Deliver a real continuing agent: persistent observations/memory, configured identity, motives, goals, one foreground stream, bounded abilities, interruptions, feedback and internally originated activity. Codex is conditional advice, not a default message router.
- Kyaw authorized local testing/setup/fixes after source commit `28971bc` and requested everyday human-style interaction checks. The earlier source-only hold is superseded for this task. No new push is requested.
- Kyaw explicitly deferred Myanmar conversation and accepted English models. Keep Myanmar catalog labels and existing literal operations; general Myanmar cognition is outside this delivery gate.
- Stack: Node/TypeScript, Fastify/SSE, React/Vite, PostgreSQL, Temporal, Ollama and optional Codex CLI. The canonical additive runtime schema is `citta.*`; original `runtime.*` records and private `.env` remain intact.
- Working tree contains verification fixes and evidence beyond the pushed source commit. Do not overwrite or reset them.

## Running services

| Service | Observed state / boundary |
|---|---|
| Updated portal | `http://localhost:4174`; root HTTP 200, database/runner ready. Uses isolated `citta_agent_dev`; English cognition is enabled for operator testing with Qwen 4B and a 300-second inference deadline. Supervisor log: `.local/state/portal-preview.log`. |
| Existing portal | Original service/data preserved on 4173. |
| Temporal | Persistent local development server on 7233, UI 8233. |
| PostgreSQL | Existing service preserved; new runtime/test databases isolated. Migrations 003–005 applied to development and verification databases. Applied migration checksums remain immutable. |
| Ollama | Loopback 11434, container quota three CPUs / 8 GiB; installed Qwen 4B and Gemma3 4B. Extra 8B download and mixed-language experiment stopped after scope changed. |

`xdg-open` returned success for the preview. CUA had no available browser surface; operator-window visual inspection is not claimed. Separate real Chromium verification used synthetic test identity/data.

## Implemented behavior

| Area | State and limits |
|---|---|
| Identity/catalogs | Immutable configured profiles, unknown fields preserved; 89/121 citta, 52 cetasikas and 14 functions. Myanmar reference terminology still needs human review. |
| Persistence/control | Durable receipts, outbox, scoped memories, source-preserving corrections/preferences, goal versions/transitions, generation fencing, pause/stop/quiet/cancel/reminders and recovery. |
| Deliberation | Local sufficient routines, bounded model proposals, independent reference/authority checks and recorded attention/appraisal/alternatives. Modeled appraisals do not establish human subjective feeling. |
| Continuing activity | Persistent motives, fresh no-input cues, scoped topic/context backoff, global work/contact budgets, private reflection, inbox initiative and non-executable improvement proposals. Timer opportunities coalesce while local inference is queued/running. |
| Abilities | Actual bounded file reads and local inference; optional nonblocking/cancellable Codex advice with attribution and unknown-effect handling. No executable self-upgrade or arbitrary generated commands. |
| UI | Real state/SSE/history, Enter/newline/IME, fixed composer, independent thread scroll, reading-position protection, inspectors and versioned proposal/contact controls. |
| Replay | Pure decision/contact/continuity comparison plus separate Temporal history replay. Current engine/policy v3 explicitly reject unsupported older-version interpretation. |

## Executed verification

These are observed checks, not a claim that every S/W scenario has passed.

| Check | Result / evidence | Limit |
|---|---|---|
| TypeScript / Vite | Passed after implementation and subsequent relevant fixes | Repeat typecheck only for new source edits; build/browser evidence matches latest UI. |
| Domain/transport checks | 26 passed, including intent authority, criteria, references, UTF-8, deadline/redirect/size/truncation handling | Transport fixture servers do not prove model competence. |
| Current engine-v3 integration | 23 passed, including persistence, control, source reads, memory/preferences, proposal/contact policy, uncertain effects and decision/continuity/Temporal replay | Recorded cognition fixtures test boundaries; they are not live model language evidence. Private log `.local/state/english-integration.log`. |
| Browser | Ten grouped checks passed after fixing a real burst-scroll race; desktop/mobile screenshots visually inspected | Synthetic test-owned identity/data. [Results](../../artifacts/verification/browser-results.json), [desktop](../../artifacts/verification/portal-desktop.png), [mobile](../../artifacts/verification/portal-mobile.png). |
| Fresh migrations | Four checks passed: additive legacy preservation, ledger repeatability, cross-agent FKs and terminal/history guards | [Results](../../artifacts/verification/migration-results.json); original database unchanged. |
| Recovery | Four actual worker/server/ownership recovery checks passed, including stale-generation fencing | [Results](../../artifacts/verification/recovery-results.json); test-owned processes only. |
| Real Codex | Smoke, live advice while a 986 ms local answer remained responsive, cancellation/no late revival, and unavailable executable classification passed | [Smoke](../../artifacts/verification/adviser-results.json), [flow](../../artifacts/verification/adviser-flow-results.json), [failure](../../artifacts/verification/adviser-failure-results.json). Unchanged adviser boundaries were tested before v3 language-policy changes. |
| Real no-input initiative | Earlier v3 model experiment originated an INITIATE and persisted it after a 336 ms identity interruption; exactly one internal inference over 191 seconds despite a 60-second timer | [Run](../../artifacts/verification/autonomy-v3-coalesced-results.json), [coalescing](../../artifacts/verification/internal-coalescing-results.json). Earlier prompt/source; its everyday run ultimately failed on Myanmar transport. Not final English acceptance. |
| Current English model | Qwen 4B automated v11 assessment passed 12/12; manual review found a false progress claim in compound identity input, now handled locally and guarded | [Results with manual review](../../artifacts/verification/qwen-v11-english.json). Inspect actions and actual text, not just JSON validity. |

## Model findings and fixes

The laptop is an i7-8650U, 32 GB RAM, CPU inference. Small local reasoning can take tens of seconds or minutes; deterministic replies/controls must remain responsive independently.

Qwen/Gemma 4B experiments failed native Myanmar semantics; those failures remain recorded and Myanmar conversation is now explicitly deferred. Source-level fixes retained from actual failures:

- Pin the current goal criterion separately from commit bookkeeping; constrain generated review to that exact criterion.
- Use action-specific output schemas: responses require review, improvements require specific benefit/criteria/risks/scope; unrelated fields are excluded.
- Constrain evidence IDs, eligible goal arguments and available file names, then independently validate them. Canonicalize repeated references in decisions while retaining the raw proposal.
- Goal mutation requires a clear operator directive. Passive praise or new factual evidence cannot grant authority to change/cancel a commitment. The model cannot override this with returned flags.
- Local HTTP honors the configured abort deadline, bounds responses to 1 MiB and refuses redirects. Explicit `think:false` requests bounded proposal output.
- Coalesce timer topics while local inference is pending; preserve bounded progress and responsive local replies.
- Distinguish known adviser startup failure from uncertain effects; preserve declined contact state.
- Follow committed messages immediately at layout time; preserve a reader's position when they scroll away.

English v8 passed 8/12. V9 fixed its four regressions, then revealed goal-revision misuse and unnecessary refusal of an answerable injected document. V10 fixed document handling but still revised a goal after praise. V11 adds independently derived goal-mutation authority. All failed artifacts remain under `artifacts/verification/`; do not relabel them as accepted results.

## Open decisions

No further product clarification is pending: English scope is accepted. Qwen 4B is enabled for operator English testing; broader acceptance remains pending; pgvector remains disabled absent retrieval evidence. Future workspace self-edit/release and doctrinal terminology review remain separately scoped.

## Remaining required work / safe resumption

1. Address operator-reported defects without competing inference benchmarks. Known issue: a speech turn can receive an `INITIATE` proposal, which the domain guard rejects with “Proactive contact is limited to an internal turn.” Restrict the proposal schema by turn type and verify the affected routing before declaring it resolved.
2. Complete the remaining live sadness/good-news/blunt-feedback/rest scenarios when operator testing permits. Reuse the recorded English assessment and actual autonomy/interruption evidence; inspect semantic correctness, not only schema validity.
3. Verify natural source-backed task completion and relevant correction/advice continuation flows. Reuse still-valid migration/control/CLI evidence.
4. Complete the S01–S60 / W01–W06 acceptance classification with evidence levels and honest gaps. S55 future workspace self-edit/evaluation/release and full doctrinal/terminology review remain separate approved scope boundaries.
5. Preserve the running operator portal on 4174, private identity, notes/history and original database. Report measured CPU latency and unfinished behavior without claiming full completion.

## Operator testing handover

Kyaw requested access to test immediately. The isolated live English exercise verified zero-input initiation, a 1,284 ms local compound-name interruption, continuation to a committed autonomous decision, no external advice, saved memory, practical presentation-worry advice and a concrete response to corrective feedback. [Actual transcript](../../artifacts/verification/english-runtime-v11.json). Remaining sadness/good-news/blunt-feedback/rest turns were interrupted for operator takeover; do not claim they passed.

Stopped that test actor through its control API, terminated its Temporal workflow and shut down all owned helper processes. Ollama CPU was observed idle before starting the operator runtime; no test inference is competing with operator use. Preserved completed evidence and marked the interruption explicitly.

Private `.env.runtime` now selects Qwen 4B, cognition enabled, port 4174 and a 300,000 ms inference deadline. Identity and database settings were preserved; the private file is ignored by git. Restarted the supervised operator services. Health observed database/runner/cognition ready and control running; browser open request succeeded. No synthetic conversation was inserted into the operator database. The original saved note remains preserved in the legacy database.

Overall delivery remains PARTIAL: operator English testing is available now; wider S/W classification and remaining live scenarios are not yet complete. Do not resume competing model benchmarks while the operator is testing. Continue with reported defects or non-disruptive inspection. Kyaw explicitly requested committing and pushing this verification checkpoint to main.

## Activity and Mind navigation refinement

Source implemented: compact searchable Activity rows with active/all/finished filters; hash-linked separate commitment detail and event-history views; controls remain in details. Mind and Memory now have separate navigation. Mind shows actual pending operations, linked commitments, prior motive topics, timestamped modeled appraisals, interests and proposal reviews; Memory retains sourced records/corrections. Historical topics are explicitly distinguished from live attention. No new backend inference or fabricated thought stream. Existing private environment work is preserved.

Verification: source/diff review only for this UI slice under the current code-only instruction. No build, typecheck, runtime or browser verification performed. Next: Kyaw runs the portal build and checks desktop/mobile navigation, browser Back, detail controls, search/filter and Mind/Memory separation.

Activity overview simplified further at Kyaw’s request: only readable status and title per row, ongoing work by default, one Show finished toggle, optional search/history tools. Descriptions and controls remain on details. Source review only; this refinement has not been built or visually verified.

## Configurable Codex cognition

Kyaw approved selecting Codex for internal consideration and conversation. Source adds an explicit codex/ollama provider, schema-constrained ephemeral CLI requests, sanitized environment, no tool execution requested, independent scoped proposal checks, provider usage metadata and honest CLI-presence health. Deterministic routines, state ownership, advice gating and action checks remain. Also restrict INITIATE generation to mental turns. Private runtime selects Codex; no service restart performed for this slice. Source/diff review only: no tests, builds, CLI calls or latency measurements executed. Next: explicitly authorized type/build and real provider verification, then coordinated restart. Existing local cognition attribution labels in persisted messages are legacy labels; provider identity is recorded in action outcome usage.

Services updated at Kyaw’s explicit request: `npm run typecheck` and `npm run build` passed. Restarted the supervised server/worker/relay; portal serves the new bundle on 4174. Health reports database/runner ready, control running, cognition provider codex with CLI configured and authentication explicitly not checked. No actual Codex cognition request or browser verification executed in this restart. Provider authentication/schema compatibility/latency remain unverified.

Mind visibility diagnosis: live PostgreSQL showed autonomous Codex internal consideration, source reading and follow-up reflection (~10 seconds each), with five-minute gaps. Added durable agent-wide internal summary history, pending operations and next eligibility time. A later provider attempt had failed; re-executing that saved context as a proposal-only diagnostic succeeded in 9,350 ms with INITIATE and did not inject a message or decision. Keep the actual earlier failure visible as an operation result. Add bounded safe failure classifications for provider capacity/model/schema rejection. Kyaw requested a ten-record cap across Mind/Activity history; source now applies it without deleting retained data. Typecheck/build passed before the final history-cap edit; final verification follows below.

Final history-cap verification: typecheck and portal build passed; restarted supervisor and observed database/runner ready. Browser workflow rendered 10 Mind history records and 7 current matching Activity rows, both within the limit. Earlier desktop Mind screenshot visually inspected; no mobile visual check performed for this slice. Original persisted history remains retained.

## Continuous internal succession refinement

Kyaw requested successive internally motivated consideration within one second when idle. Source/default/private runtime now select 1000 ms continuous mode: old global/motive cooldowns no longer create idle five-minute gaps, least-used enabled motives rotate, and per-motive context/previous-topic records remain. Larger intervals retain paced mode. Pending inference/mental observations still coalesce; input/results, controls and budget gates remain. No claim that provider generation completes in one second. Autonomous work still stops at half the hourly budget; unlimited cognition is not implemented. Source/diff review only for this refinement; no tests/build/restart executed. Next: authorize verification/restart and observe actual successive internal turns with no input.

## Activity module outcomes delivered

Activity details now render the latest ten reconstructed processing steps, each with module, operation and concise persisted outcome. chanda/manasikara appear only when snapshots retain their involvement; sati/cetana/vedana summarize saved context/decision/appraisal, kamma shows actual operation state, paccavekkhana requires a review flag. Raw payload accordions removed from the inspector; commitment/budget metadata remains collapsed. Poll details every five seconds with abort cleanup. Full internal prompts are no longer the default detail heading.

Verification: typecheck passed; final portal build and docs/diff checks passed. Focused assertions cover empty records, failed operation without invented review, and live scoped goal details capped at ten. Restarted supervisor with continuous mode active. Browser showed seven recorded steps and healthy database/runner, verified mobile overflow absence; visually inspected desktop/mobile and shortened the overly long internal heading, then rebuilt. No final screenshot after that heading-only fix. Live database independently showed successful consecutive Codex internal turns ending 08:02:51.662 / next dispatch 08:02:52.912 and ending 08:03:02.409 / next dispatch 08:03:03.724 UTC (about 1.3 seconds between consideration calls). No claim of a strict sub-second deadline.

Selected-activity detail refinement: removed per-goal decision/action/version/transition query limits and the ten-step renderer cap. All retained module steps and full outcomes are available for a selected activity, with full state-change history in a readable disclosure. Overview and Mind history caps remain ten. No persisted data removed.

Selected-activity verification: typecheck/build and diff check passed. Focused assertion retained 20 steps and a 500-character outcome without truncation. Rebuilt and restarted supervised services; browser confirmed uncapped detail wording, with database/runner ready.

## Human-style laptop capability — source implemented, unverified

Kyaw requested web search/view, files/code, Git and computer use, then explicitly chose human-style operation of the actual laptop rather than service APIs or an isolated desktop. No Brave/search API implementation was added. The repository was previously pushed to main at b24d638; this extension is uncommitted.

Added COMPUTER proposal/ability, additive migration 006, a loopback authenticated Python GI/GStreamer XDG RemoteDesktop/ScreenCast driver, screenshot feedback and Codex image attachment, complete context→authorization→dispatch→result review→continuation wiring, unknown physical-effect handling and receipt deduplication. The supervisor can launch the driver with a sanitized desktop environment and a private token. Mind has OS session connect/disconnect controls. Private runtime opts into laptop capability and autonomous use but the currently running services have not been restarted and no OS session is opened automatically.

Static environment inspection: actual GNOME Wayland, Python GI/Gio/Gst/Gtk/Pillow available; xdotool/pyautogui absent. Desktop portals provide the selected supported path. No application code, tests, typecheck, build, migration, desktop session or physical input executed for this source-only slice. Source/diff inspection is not runtime acceptance.

Required next: explicitly authorized verification of TypeScript/Python, focused command/unknown-effect checks and migration 006; build/restart; Kyaw approves the OS screen/input dialog; then verify actual screenshot and harmless pointer/key feedback, freshness/coordinate behavior, pause/stop/disconnect and no replay after a lost physical outcome. Actual browser search, file editing and Git workflows remain unverified until performed through the laptop UI. Source generation does not establish that those tasks work.

Source review also confirmed independent dispatch requires the approved-session context and an observed frame before input. Desktop access is not a filesystem sandbox: it has the logged-in user’s OS rights, and the sharing session is the actual access boundary. This remains an explicit acceptance limitation, not a claim of a sandboxed agent. No source-only verification was represented as a passed runtime test.

## Direct Codex connection and isolated working memory — source implementation

Checkpoint: e675872 committed the current desktop capability before this integration; it was not pushed. Kyaw then confirmed cloud Codex reasoning, Citta-owned local storage and portal-started authentication. He clarified that mind processing should retain Citta-specific Codex working context; this supersedes the earlier fresh-thread-per-consideration draft.

Source now adds a persistent local app-server manager, isolated per-agent CODEX_HOME, managed ChatGPT sign-in redirect/cancel/logout and API-key submission from a new Connections page. No password is collected by Citta; request logs redact the key and broker authorization. A private loopback broker carries worker requests to the server-owned process. Account state is distinct from verified inference, and disconnected state suppresses autonomous model dispatch. Original personal CLI credentials and existing Citta database/profile/history are untouched.

Migration 007 stores agent/conversation/profile/context-version working-thread references. Actual runtime considerations reuse/resume scoped provider working threads; external advice and synthetic evaluator contexts are ephemeral. Current evidence/permissions override old provider context; note/preference invalidation rotates the provider context key. Explicit context reset or disconnect interrupts active turns and clears provider references without deleting durable Citta memories/history. Concurrent use of one working thread is serialized; loaded working threads are bounded. Provider reasoning receives selected relevant context, not the entire Citta database. Durable knowledge/lesson consolidation and reusable-skill learning remain unfinished; provider threads do not train model weights.

Verification status: source/diff review only. No app execution, typecheck, build, tests, migrations, login flow, API key or provider call executed for this integration, under the source-only instruction. CLI protocol docs were inspected against installed version 0.171.0; compatibility is not yet verified by execution. The currently running portal remains the previous service version.

Next: when Kyaw explicitly authorizes execution, run focused type/protocol/auth/cancellation checks, apply 006–007 to the isolated runtime database, build/restart services and inspect Connections on desktop/mobile. Kyaw must complete OpenAI sign-in or supply his API key in the portal, and separately approve the GNOME desktop session. Verify real working-thread reuse, restart resume, correction reset, account isolation, unknown effects, and actual screen/input feedback before claiming delivery. Keep any generated auth tokens/screenshots private. No additional commit/push was inferred.

Final source review: scoped working threads now wait for terminal interruption feedback (or reset a nonresponsive local connection), discard commentary as final output, bound loaded contexts and isolate file-based credential storage in Citta’s private CODEX_HOME. The environment template defaults to portal-connected Codex while exec remains explicit. Read-only documentation checker passed (13 Markdown files) and git diff whitespace checks passed. No application checks or services were executed; acceptance remains pending.

## Portal connection restart and requested commit/push

Kyaw explicitly requested restarting services, then committing and pushing. Applied migrations 006–007 only to `citta_agent_dev`; original legacy database unchanged. Rebuilt portal and restarted the supervised server/worker/relay plus local desktop driver. Live health: database/runner ready, Codex app-server available but not signed in, desktop driver enabled but no approved session. No personal CLI credential import or sign-out occurred.

Verification completed:
- Typecheck passed after fixing one environment-object type annotation; portal build passed; Python driver syntax compiled. Generated Python cache was removed.
- All 28 existing domain/transport tests passed. New simulated-provider protocol regression passed: credential environment isolation, sign-in/cancel state, final completion before acknowledgement, failed-turn handling, cancellation and following-turn recovery. This is a transport simulation, not proof of model competence.
- Actual installed Codex app-server initialized and account/read worked. Actual managed browser sign-in start returned a trusted URL and was cancelled cleanly without opening a login or entering credentials. Local invalid-key input was rejected before provider use, cross-origin login was blocked, and unauthenticated broker generation returned 403.
- Read-only live working-context SQL resolved valid ownership and rejected an invalid conversation; no fixture rows were written to the operator database. Private driver/broker tokens observed at 0600. No new internal opportunity was dispatched while Codex remained disconnected.
- Browser rendered Connections, protected API-key input and Mind desktop-share control with no page errors. Desktop/mobile screenshots were visually inspected; mobile horizontal overflow check passed. Screenshots remain private under `.local/state`. Desktop observe without an approved session was rejected before input.
- Read-only docs and git diff checks passed.

Remaining gates: Kyaw signs in through Connections (or enters his own API key), then actual provider generation, working-thread reuse/restart resume and memory-correction rotation must be verified. Share this desktop in Mind requires Kyaw’s GNOME permission approval; no physical input or terminal/file/Git job has been executed by Citta. Automatic reusable-skill consolidation remains separate unfinished work. Overall application delivery is still PARTIAL; this checkpoint provides a running portal and direct connection setup, not verified autonomous computer operation.
