# Local operations

**Scope:** commands provided by the source, with actual verification recorded separately in [status](../delivery/status.md). The continuing runtime is under implementation. Do not infer a working installation from this guide. Kyaw requested source implementation first; do not execute the following setup, build, migration, startup or test steps until Kyaw explicitly requests execution. Source completion alone is not authorization.

## Configuration and data

Use Node.js 24 and npm. Preserve the populated private `.env`; `.env.example` documents public variable names. Runtime commands also load private `.env.runtime`, which can select an isolated database without editing the existing configuration. Exported environment values override file values. Never commit either private file or paste database URLs into logs/chat.

| Variable | Meaning |
|---|---|
| `DATABASE_URL` | Existing local PostgreSQL connection; legacy commands retain this database |
| `CITTA_DATABASE_URL` | Optional separate continuing-runtime database, normally selected through `.env.runtime` |
| `CITTA_AGENT_ID` | Stable local agent ID; default `local` |
| `CITTA_PORT` | Loopback portal port; default 4173 |
| `CITTA_NAME`, `CITTA_AGE`, `CITTA_GENDER` | Configured conventional identity; age 0-150 or unknown |
| `CITTA_BACKGROUND`, `CITTA_OCCUPATION`, `CITTA_LOCATION`, `CITTA_LANGUAGE` | Optional configured background; unknown fields remain unknown |
| `CITTA_VALUES`, `CITTA_GOALS` | Values/aspirations, never executable permissions |
| `CITTA_CODEX_PATH` | Optional Codex executable or JavaScript CLI entry point; otherwise PATH discovery |
| `CITTA_ADVISER_ENABLED` | Set `false` to disable external consultation |
| `CITTA_TEMPORAL_ADDRESS`, `CITTA_TEMPORAL_NAMESPACE` | Local Temporal endpoint/namespace; defaults 127.0.0.1:7233 / default |
| `CITTA_OLLAMA_URL`, `CITTA_LOCAL_MODEL` | Local HTTP inference endpoint and explicitly selected model |
| `CITTA_MODEL_THREADS` | Local inference threads, default 3 matching the development container CPU quota; range 1–8 |
| `CITTA_INFERENCE_TIMEOUT_MS` | Inference deadline; default 300000 ms for CPU inference |
| `CITTA_INTERNAL_INTERVAL_MS` | Internal opportunity interval; default one second (continuous succession); larger values select paced mode |
| `CITTA_CONTACT_INTERVAL_MS` | Minimum proactive-contact interval; default one hour |
| `CITTA_HOURLY_WORK_LIMIT` | Persisted global expensive-work allowance; 0 means no app hourly cutoff; default 12 |
| `CITTA_READ_ROOT` | Permitted local evidence directory; default `data/fixtures` |

For this laptop, `.env` retains credentials and configured identity. `.env.runtime` explicitly selects the continuing-runtime database, port 4174, English language, Codex App Server reasoning, a five-minute inference deadline, one-second idle internal opportunities, hourly proactive contact and no app hourly cutoff (work limit 0). The optional Ollama path retains its separately configured model/thread settings. Both files remain private. Runtime overrides take precedence over `.env`; shell exports take precedence over both files. Keep the agent ID and database selection stable to retain the same individual and history.

Identity snapshots are immutable and versioned at service initialization. Changing `.env` requires a coordinated service restart. Existing goals retain their pinned context. Model proposals and adviser speech cannot edit configured identity or grant abilities. The configured profile can be shared in explicit adviser requests; do not put secrets in these background fields.

## Initial local preparation (deferred)

1. When execution is explicitly requested, install dependencies with `npm ci`. The lockfile owns exact dependency versions.
2. With the existing PostgreSQL credentials available, `npm run db:prepare` creates/selects `citta_agent_dev` and writes `.env.runtime` only if absent. It does not change the user's `.env` or existing database. The database role needs CREATE DATABASE; otherwise create a dedicated local database administratively and set `CITTA_DATABASE_URL` privately. A permission error is not permission to drop or overwrite existing data.
3. Run `npm run db:migrate`. The ledger applies only continuing-runtime migrations from 003 onward, atomically and with checksum checks. Prototype migrations 001/002 are intentionally excluded. Never rewrite an applied file; use a new additive migration.
4. Install the official Temporal CLI at `.local/bin/temporal`. `npm run temporal` starts a **development** Temporal service with persistent `.local/state/temporal.db`, gRPC 127.0.0.1:7233 and UI 127.0.0.1:8233. This setup is laptop working mode, not a production Temporal deployment.
5. `docker compose up -d ollama` starts the resource-bounded local model service. Pull the selected candidate with `docker compose exec ollama ollama pull qwen3:4b-instruct-2507-q4_K_M`. Check the model assessment before accepting its English/Myanmar quality. One local inference at a time uses CPU initially; no automatic cloud fallback.
6. Run `npm run build` to produce the React portal, then `npm start` to supervise server, worker and relay. Open `http://127.0.0.1:4173`.

If an existing Ollama endpoint already occupies 11434, use it deliberately or stop only the assessment-owned service; never stop unrelated containers to claim a successful setup. The shared `citta-ollama-models` volume retains downloaded model weights. Removing a container does not require deleting that volume.

## Commands and supervision

| Command | Source-provided operation |
|---|---|
| `npm start` | Foreground Node supervisor for Fastify server, Temporal worker and outbox relay; child failures restart with backoff |
| `npm run stop` | Requests shutdown only of the identified Citta supervisor; PostgreSQL/Ollama/Temporal remain separate |
| `npm run portal` | Continuing-runtime HTTP/SSE server alone; requires migrated schema and built portal |
| `npm run worker` / `npm run relay` | Individual runtime processes for diagnosis |
| `npm run temporal` | Persistent loopback Temporal development service |
| `npm run typecheck` / `npm run build` | Deferred source and portal build checks |
| `npm run replay:export -- PRIVATE_PATH` | Creates a non-overwriting private domain-decision export containing selected conversation/profile context |
| `npm run replay -- PRIVATE_PATH` | Offline pure-decision comparison; no live DB, model or ability imports |
| `npm run replay:temporal -- HISTORY_PATH` | Separate Temporal workflow replay from exported history, without live Activities |
| `npm run portal:legacy` | Preserved prototype portal; do not run on the same port or treat it as the new runtime |
| `npm run catalog` / `npm run eye` | Preserved doctrinal reference commands, documented in [catalog](../reference/catalog.md) |
| `npm run recall`, `auto-recall`, `demo`, `trace` | Preserved fixed prototype scenarios; not general runtime/replay acceptance |

Optional user-systemd templates are in `tools/local/`: inspect paths and ensure the service environment can find Node/npm, then install deliberately under `~/.config/systemd/user/`. The Node supervisor starts no database or model downloads. Ctrl+C gracefully stops its own children; forced shutdown after the deadline leaves unknown external effects for reconciliation.

## Portal behavior

Accepted input is persisted before the receipt is returned. A receipt is not an answer. The portal reads committed messages and reconnects through SSE plus authoritative state refresh. A failed/uncertain HTTP submission retains the exact message ID for retry. Refresh never makes browser storage the authority for history.

Enter sends, Shift+Enter inserts a newline and IME composition does not send. The conversation scrolls independently of navigation/composer; arriving turns follow the bottom unless the operator is reading older text. Activity shows commitments, sourced reasons, pending effects and limitations. Mind & memory separates reported/observed/inferred records and preserves superseded corrections. The catalog remains a separate reference with draft Myanmar labels.

Useful exact local commands: `remember <note>`, `recall`, `read file <relative-path>`, `ask <question>`, and `help`. Natural input goes to sufficient local routines or bounded local cognition. `ask` explicitly requests optional external advice; it is not required for ordinary thought. `/pause`, `/resume`, `/stop`, `/quiet`, `/unquiet` are exact control directives usable even while deliberation is paused. Buttons provide the same operator control boundary. Cancel requires a specific goal; ambiguous requests clarify.

Pause preserves pending work/results and prevents new deliberation/dispatch. Stop cancels existing goals and disables initiative until resume. A started effect may still finish; late results cannot resurrect cancelled work. Quiet suppresses proactive local contact while allowing internal reflection. A closed tab is not proof of availability; proactive output can remain in the local inbox, with seen status only when observed. No third-party notification capability exists.

## Recovery, cutover and rollback

PostgreSQL owns accepted input/domain state; Temporal owns execution history. Outbox wakeups and periodic reconciliation recover missed notifications. One stable workflow ID owns the agent; a closed execution is **not** automatically replaced. Diagnose it first and perform an explicit fenced recovery; do not delete Temporal state to make an error disappear. Heartbeat loss makes adviser effects unknown and blocks blind repeat. Reads/model work report failures rather than inventing success.

Preserve original `.env`, legacy schema/data and the isolated database. Cut over the portal only after the new path passes its gates. A code rollback can run `portal:legacy` on the original database after stopping the new HTTP process; it does not drop the `citta` schema, remove committed observations, edit applied migrations or erase model weights. New data remains available for later resumption.

## Model evaluation and acceptance

The [model assessment](../design/model-evaluation.md) owns hardware/candidate evidence. The pending assessment coordinator was stopped when Kyaw requested implementation first. Download completion alone does not establish model suitability. Once code is complete, evaluate the selected local endpoint with the synthetic paired English/Myanmar fixture protocol and then verify integrated flows separately. Human Myanmar terminology/naturalness review remains necessary; valid JSON is not a language-quality guarantee.

For an already prepared local endpoint, the proposal-only evaluator is `python3 tools/evaluation/evaluate_ollama.py --model qwen3:4b-instruct-2507-q4_K_M --output artifacts/evaluation/qwen3-4b-en-my.json`. It does not read `.env`, start services or execute proposed actions, and refuses to overwrite evidence. Do not run it during the implementation-only stage.

Additional continuing-runtime operations: `npm run db:import-notes` repeat-safely imports actual legacy saved notes into the selected runtime database, with source provenance and unknown original timestamps explicitly retained. It never invents old conversation turns or deletes originals. Browser-only prototype history is not a database record and is not silently imported.

`npm run workflow:recover -- RECOVERY_UUID` replaces only a closed Temporal execution, once per prior execution, with an incremented fenced generation. Reuse the same UUID after an uncertain result. Running owners are never terminated by this tool. Old running effects become explicit unresolved outcomes; queued work is reauthorized in the replacement generation. This is an explicit recovery command, not an automatic restart loop.

`CITTA_COGNITION_ENABLED=false` is the initial default. After the selected model passes evaluation, enable it explicitly in private configuration and restart the services. The runtime uses an 8192-token model context with bounded selected excerpts; the earlier proposal smoke benchmark uses its own recorded context setting. That benchmark cannot substitute for evaluating the integrated runtime prompt/schema and UI flows.

`remind at <ISO timestamp with timezone> <note>` schedules a local reminder within thirty days. Exhausted goals have an explicit budget-extension control; unknown effects cannot be unblocked by it. Proactive turns offer Reply/Decline controls so unrelated messages do not fabricate acknowledgement. The catalog has separate 89/121 citta views.

## Runtime state and reviews

Migrations 003–005 add the continuing runtime, version/state history, scoped preferences, proposal reviews, continuation depth and declined-contact state. They have been applied to isolated test/development databases after explicit testing authorization; the original legacy database is preserved. Use the checksum migration runner for a new runtime database. See delivery status for actual acceptance evidence.

The activity inspector reads actual retained criteria, budgets, frames, context, alternatives and effects. Proposal Accept/Decline records review of an exact version; accepting an idea does not authorize a code/model/policy/deployment action. `prefer response-language en`, `prefer response-length concise|detailed`, and `prefer explanation-style plain|technical` save operator-sourced conversation preferences without changing identity or permissions. `CITTA_AFFECT_ENABLED=false` supports the planned software ablation while retaining task interpretation and independent checks.

Domain replay v3 compares recorded decision/attention choices, derived contact effects and the continuation ledger from a consistent private export. Older/missing engine or proof information is reported unsupported. Execution and remaining model acceptance results are recorded in `doc/delivery/status.md`.

## Codex cognition selection

Set `CITTA_COGNITION_PROVIDER=codex` in private `.env.runtime` to use Codex for non-routine conversation and internal consideration. `CITTA_CODEX_PATH` selects the installed CLI; optional `CITTA_CODEX_MODEL` overrides its configured model. Existing CLI login is required. `CITTA_COGNITION_ENABLED` gates either provider, while `CITTA_ADVISER_ENABLED` independently gates optional advice. Selected context/profile/source excerpts are sent externally when Codex consideration runs, including autonomous turns. No automatic fallback occurs. Set provider to `ollama` for the existing offline path. Restart all supervised services after changing selection. Health checks CLI presence only, not authentication or model latency; those require an actual provider request.

Continuous succession uses `CITTA_INTERNAL_INTERVAL_MS=1000`. Once a consideration/result is processed, another enabled interest can be selected on the next idle reconciliation cycle, without waiting for the old five-minute timer or a motive cooldown. Existing inference coalescing prevents overlapping model calls. Provider response time, controls, motive availability and budgets still apply. Autonomous and operator work use the same explicit allowance; there is no hidden half-budget stop. Set `CITTA_HOURLY_WORK_LIMIT=0` for continuous operation without an app hourly cutoff. Per-goal limits, provider account limits, availability and operator controls still apply. Mind displays an actual blocking reason if progress cannot continue. Waiting activities expose their question and a Reply & continue form that resumes the same commitment. No heartbeat is logged as a fictitious thought.

## Real laptop desktop use (source implemented; not yet verified)

Kyaw chose the current GNOME Wayland desktop. Web search, page reading, code/file editing and Git are performed through visible applications, not service-specific search or Git APIs. No Brave key or separate desktop/container is required for this design.

`CITTA_COMPUTER_ENABLED=true` enables the local driver; `CITTA_COMPUTER_AUTONOMOUS=true` also permits internally initiated computer actions. Keep autonomous use false if only operator-originated tasks should use the desktop. `CITTA_COMPUTER_PORT` defaults to 4180 on loopback. Codex cognition is required for screenshot interpretation. Existing global/goal budgets apply to observations, inputs and model calls.

The supervised helper uses `/usr/bin/python3`, PyGObject (`Gio`, `GLib`, `Gst`), Pillow, PipeWire/GStreamer capture, `videoconvert` and `jpegenc`, plus GNOME's XDG RemoteDesktop/ScreenCast portals. The laptop inspection found Python GI/GStreamer/Pillow libraries; individual capture elements and actual permissions have not been executed or verified. If preparation is needed on Ubuntu, the relevant packages are `python3-gi`, `python3-pil`, `gir1.2-gstreamer-1.0`, `gstreamer1.0-pipewire`, `gstreamer1.0-plugins-base` and `gstreamer1.0-plugins-good`. Do not run setup during a source-only task.

Before activating this extension, apply additive migration 006 through `npm run db:migrate`, rebuild the portal and restart supervised services. The supervisor creates `.local/state/computer.token` privately and launches the driver with desktop-session environment only. Neither screen capture nor physical input starts automatically. In Mind, select **Share this desktop**, choose the monitor and approve screen/keyboard/pointer access in the OS dialog. This OS consent cannot be granted by an environment variable or chat instruction. **Disconnect computer**, the desktop sharing indicator, or terminating the helper revokes the session.

A task can then ask Kyaw2 to search in the browser, open a page, write code in an editor or use Git in a terminal. One physical action is followed by a screenshot and a new consideration. The latest 100 images are retained privately for active-context replay; older screenshots may expire and require observation again. Operation receipts persist to avoid replaying physical input after uncertain execution. Screenshots may contain visible personal information and are sent to the configured Codex provider for this capability; credentials and secrets must not be entered through logged computer commands. A successful mouse/key delivery is not proof the application task succeeded. Verify the displayed outcome before reporting completion.

The driver and services have now been started and pending migrations applied to the isolated development database; actual verification is recorded in delivery status. Real screen/input control remains unverified until the approved Wayland session, screenshot, click/key feedback, interruption, revocation and unknown-effect behavior have been observed on this laptop.

## Portal-started Codex sign-in and working memory (source implemented)

`CITTA_CODEX_TRANSPORT=app-server` selects the direct local protocol (default). `exec` explicitly retains the earlier per-request CLI transport; no automatic transport fallback occurs. `CITTA_COGNITION_PROVIDER=codex` selects Codex for reasoning. The optional `CITTA_CODEX_MODEL` remains the model override. No OpenAI password or API key belongs in the identity environment fields.

Apply pending migrations through 007, build, and restart only when execution is authorized. In the portal, open **Connections** and choose **Sign in with ChatGPT**. Citta opens the authorization URL returned by Codex; enter credentials only on OpenAI’s page. Codex owns the browser callback, token storage and refresh. The portal polls for completion and supports cancelling an unfinished login. Alternatively, expand **Use an API key instead** and enter the key locally; the field clears on submission. Connecting establishes account state; a completed consideration separately verifies model access.

Citta’s account cache lives under private `.local/state/codex/<agent>/home`, separate from the personal CLI’s CODEX_HOME. Never copy or export this credential directory. The local broker token is private and never sent to the browser. The server owns the persistent app-server process; workers use the authenticated loopback broker. Account disconnect interrupts considerations and resets provider working-thread references, preserving Citta’s PostgreSQL experiences, memories, goals and history.

Live Citta considerations reuse dedicated working threads scoped by agent, conversation, profile, prompt/schema version and memory-correction epoch; restart resumes them. External advice and synthetic proposal evaluation remain ephemeral. The current selected Citta context overrides old provider context. Corrected notes invalidate the working-context key. If provider history is unavailable, **Start fresh working context** resets those references and interrupts in-flight considerations without deleting Citta memory. Provider compaction is not durable memory consolidation; reliable automatic reusable-skill learning is still a separate unfinished capability.

Until sign-in is complete, autonomous model dispatch is suppressed; deterministic local replies and controls remain usable. An interrupted/failed turn is never reported successful merely because a request was accepted. The initial source-only integration was later activated at Kyaw’s explicit restart request; delivery status owns the exact verification results and remaining login/desktop-consent gates. No real API key or account login was completed during verification. The earlier CLI smoke/failure checks specifically exercised exec mode; use `CITTA_CODEX_TRANSPORT=exec` to repeat those legacy checks, and verify the app-server path separately.

## Continuing mind and waiting activities

Mind shows confirmed consideration/ability/review activity, readiness or a specific block. Only actual internal decision summaries enter history; scheduler text and heartbeat ticks are not invented thoughts. The latest ten summaries remain visible while another consideration runs. Activity retains waiting commitments with Needs your reply / Needs evidence labels; open one and use Reply & continue to supply input for the same goal. Closed exhausted attempts are history, not ongoing work.

`CITTA_CODEX_PROGRESS_TIMEOUT_MS` defaults to 60000 ms without provider progress. A stalled turn is interrupted and a 30-second provider cooldown prevents repeated immediate failures. Provider event metadata may indicate awaiting output, reasoning, responding or retrying; raw reasoning text is not exposed. During provider/OS/account unavailability, retain context and show the reason rather than fabricating thought content. Work limit 0 removes only the app hourly cutoff, not provider or per-goal limits.

## Replying to conversation messages (source extension)

After migration 008 and a portal rebuild/restart, each message has Reply. The composer shows a quoted preview and Cancel reply. Enter/Shift+Enter/IME and retry IDs retain their existing behavior; confirmed history stores the parent message and a scoped quote, including after refresh or loading older messages. A reply to the current unanswered question resumes that activity; other replies provide context for a new turn. Activity’s Reply & continue remains available.

Questions that need the operator’s answer belong in conversation. Self-originated questions use proactive delivery and may show Question queued while Quiet/contact constraints apply. Private reflection can continue while a question waits. Only one internally generated operator question is outstanding at a time. An expired or declined question is not treated as successfully answered.

Computer capability and an approved session are separate. When enabled but disconnected, Citta should explain that browser/terminal control needs **Mind → Share this desktop** and the GNOME permission dialog, rather than claim browser support is missing. The model receives explicit configured/connected/allowed state. The local HTTP status observed during this source change was enabled=true, connected=false. This extension has not been built, migrated, restarted or runtime-verified.

## Milestone reports

Migration 009 adds durable milestone reports. Substantial operator tasks (at least three decisions plus a non-inference action) produce reports when completed, exhausted or waiting for evidence/input. Recorded improvement proposals also produce a report. Routine replies and idle reflections do not. Each report shows recorded work/outcome, evidence categories, open issues and next step with a View activity details link in conversation. A completed task is not independent proof that its claims are correct.

Quiet/paused mode defers automatic reports. They share the contact interval with conversation openings but do not require an acknowledgement. Old-version/cancelled pending reports are suppressed. Historical ideas are retained; this change does not backfill prior milestones or solve topic-selection feedback loops.

## Continuing-focus and navigation correction (source only)

Migration 010 adds one active focus per agent plus retained focus history. It is not applied by source editing. After an authorized migration/build/restart, Mind displays the retained concern, actual recorded step, next step, source activity and reason. Ordinary communication/new conversation does not reset that concern. Free exploration may defer it and later return. This slice supplies a selected concern and its bounded sourced notes across conversation boundaries; complete agent-wide conversational memory retrieval remains separate work.

Portal view navigation writes the current view into the URL hash. Refresh restores that view, including Activity detail IDs. Existing conversation IDs remain in local storage; changing a view does not create a new conversation.

## Inference context-budget errors

The selector bounds complete context to 10,000 UTF-8 bytes, rather than a token count. It excludes exhausted/closed targets, excerpts optional descriptions, reduces background goals before evidence, protects current request/criterion/focus sources and records omitted/excerpted context metadata. The original stored memories/tasks are not deleted. “Undetermined” on an infrastructure error means no modeled tone was assigned; it is not evidence of a human feeling. An irreducible request/focus/policy overflow is reported as an application context limit before a provider call, not as a request to use cloud fallback when Codex is already configured.

## Dashboard

Dashboard is the landing page. It shows ten actual shared updates at a time across Kyaw2’s conversations: initiatives, unanswered questions and milestone reports. Use All updates, Needs your reply or Milestone reports, and Older/Newer to browse history. Reply opens the source conversation with that message quoted in the existing composer. View activity opens the originating goal. A retained-concern preview links to Mind.

Waiting to share shows up to ten currently queued/deferred contacts, explicitly not delivered. Opening the dashboard does not override Quiet or delivery limits. Source messages/history remain authoritative. Migration 011 adds feed indexes; apply before deploying the new API. Dashboard reads do not mark messages answered or approve proposals.
