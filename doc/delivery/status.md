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
