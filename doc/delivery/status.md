# Current status and next safe task

**Updated:** 2026-11-22. **Authority:** sole record of implementation progress, actual verification and unresolved decisions. The [development plan](plan.md) defines gates; the [approved architecture](../design/architecture.md) and [flows](../design/behavior-flows.md) define the target.

## Baseline and current position

- Kyaw accepted architecture A01-A07 and behavior F01-F20, S01-S42 and W01-W03 as the basis for development.
- Kyaw requested an explicit internal-initiative refinement on 2026-11-22: A08-A09, F21-F26, S43-S60 and W04-W06 add new topics/activity with no pending work, proactive local conversation and improvement proposals. This is a design extension, not implemented behavior.
- Kyaw accepted the stack on 2026-11-22: TypeScript/Node, Fastify, React/Vite, Temporal, PostgreSQL, conditional pgvector, Ollama local cognition, optional Codex advice, structured events/OpenTelemetry and Compose/systemd supervision. vLLM is a later scaling option. A10 records the deployment topology; no packages or services have been installed for this decision.
- Documentation is reorganized around that baseline. Competing old milestone/folder/schema instructions and duplicate progress paragraphs are removed. Git history retains prior document revisions.
- The code remains a prototype. P0 is the next design/implementation-specification task; no P1-P6 gate is complete.
- This documentation cleanup does not migrate data, alter application code, install packages, run application checks or restart services. Existing unrelated source/configuration work remains untouched.

## Capability inventory

| Area | Current source/state | Gap against accepted design |
|---|---|---|
| Catalog/simulation | File-backed citta, mental-factor and function lists; factor associations and selected door fixtures | Full source/version validation, inverse coverage and comprehensive sourced positive/negative fixtures remain unverified |
| Myanmar descriptions | Draft `labelMy` fields in the three catalogs | Terminology review pending; no claim of verified Burmese-source transcription |
| Profile | `.env` loader for name, age, gender, background, occupation, location, language, values and goals | No persisted immutable profile/run versions |
| Portal consideration | Regex rules choose profile/local/help/clarification or call Codex | No shared durable attention/consideration/action/review cycle; broad questions may still route directly by keyword |
| Memory/history | PostgreSQL portal notes and fixed lamp/quote state; tab session-storage conversation/trace | No general sourced memory/context retrieval, durable full chat, goal versions or continuations |
| AI integration | Existing CLI adapter; local executable path; profile/question prompt; attributed reply | No durable nonblocking dispatch, gap-based selection, independent registry policy or evidence review |
| Continuity/control | Fixed scenario checkpoints only | No foreground interruption frames, fairness, pause/resume/stop runtime or automatic durable goal scheduler |
| Internal initiative | Fixed lamp recall only; configured goals remain profile text | No persistent interests/ambitions, fresh-topic cycle with no pending work, local conversation initiation or capability-improvement proposals |
| Modeled affect | Limited fixture/feedback functions | No contextual persisted appraisal/tendency/regulation or measured effect on choices |
| Recovery/replay | Demo progression and trace retrieval | General claim-token recovery, uncertain-effect reconciliation and isolated offline replay not implemented |

Presence of source code does not mean runtime or visual acceptance. The capability inventory is intentionally distinct from the target architecture.

## Phase status

| Phase | State | Next evidence needed |
|---|---|---|
| P0 executable contracts | Not started | Concrete lifecycle/API/DDL/adapter transition review and decisions |
| P1 durable local cycle | Not started | Real local zero-adviser cycles, deduplication, ownership and durable readback |
| P2 continuity/control | Not started | Pending scripted action interrupted/resumed/cancelled/recovered correctly |
| P3 contextual memory/affect and initiative | Not started | Sourced context, fresh internally originated topics with no pending work, proactive local conversation, improvement proposals and contextual appraisal scenarios |
| P4 local evidence abilities | Not started | Actual permitted fixture result reviewed into a sourced conclusion |
| P5 optional adviser | Not started | Justified nonblocking consultation through durable actions and verified/qualified review |
| P6 replay/integrated acceptance | Not started | Offline isolation and complete acceptance matrix with actual results |

## Verification evidence and limits

| Date / scope | Evidence actually obtained | Limit |
|---|---|---|
| 2026-11-20 local preparation | Node 24.16.0, npm 11.13.0; dependency installation completed; audit reported zero vulnerabilities at that time | Not a current audit or version guarantee |
| 2026-11-20 database/prototype | Configured local database created; migrations 001/002 applied; PostgreSQL 16.15 accepted connections | No new-runtime schema or migration acceptance |
| 2026-11-20 prototype checks | Eye/catalog, auto-recall resolution/revisit, quote demo/trace and TypeScript check passed after union-access fix | Later source changes were not all rechecked; no general replay proof |
| 2026-11-20 portal/API | Assets, remember/recall with DB confirmation, duplicate retry, conversation isolation, text reading and request rejection checks passed | Predates identity/continuing-runtime work; browser UI not verified |
| 2026-11-20 Codex route | Explicit and plain-message HTTP smoke requests returned actual Codex replies; route assertions and TypeScript passed for that revision | Earlier direct/plain-message routing is superseded as the target; not evidence for current new-runtime behavior |
| Later portal startup | Portal restart returned HTTP 200; PostgreSQL accepted connections | No end-to-end identity, affect, continuity or visual acceptance |
| 2026-11-21 design artifacts | 20 behavior and seven architecture drawings rendered; PDF pages visually inspected | Document rendering only; Mermaid-specific renderer and gallery controls not tested |
| 2026-11-22 documentation cleanup | All 12 Markdown files passed local link/anchor and duplicate-heading checks; A01-A07, F01-F20, S01-S42 and W01-W03 were preserved; source/renderer/output hashes and whitespace checks passed; regenerated PDFs were visually reviewed | No application behavior is verified by these checks; Mermaid-specific rendering and gallery interaction remain unverified |

The initiative refinement is documentation-only: internally chosen fresh topics/activity, outgoing local conversation and improvement proposals remain unimplemented. On 2026-11-22, all 12 Markdown files passed link/anchor, duplicate-heading and stable-identifier checks for A01-A09, F01-F26, S01-S60 and W01-W06. Source/renderer/output hashes and whitespace checks passed. The refreshed 44-page behavior and 14-page architecture PDFs were rendered; new/changed drawings, metadata, scenarios and walkthroughs were visually inspected. None of this is application acceptance; Mermaid-specific rendering and gallery interaction remain unverified.

Stack-baseline verification (2026-11-22): all 12 Markdown files passed internal link/anchor, duplicate-heading and stable-identifier checks including A10. Source/renderer/output hashes and whitespace checks passed. The 44-page behavior and 17-page architecture PDFs were regenerated; changed topology, stack tables, replay/local-cognition and adviser-boundary pages were visually inspected. No application code, dependencies, database or services changed.

Local test data was retained: resolved lamp, a quote demo run and one synthetic portal note. No cleanup/deletion of database data is authorized by this document reorganization.

## Open decisions

| ID | Choice / risk | Required resolution and gate |
|---|---|---|
| DEC-01 | Actual local model and hardware | Ollama local cognition is agreed; P0 evaluates candidate models on English/Myanmar tasks, schema/semantic validity, uncertainty, latency and hardware. No automatic external fallback. Broader human equivalence is not implied. |
| DEC-02 | Temporal/PostgreSQL boundary and schema | P0 defines exact workflow/activity ownership, domain versions, outbox/deduplication, dual-write reconciliation, SQL/state constraints and migration order; preserve existing data. |
| DEC-03 | Interruption/control endpoints and stream cursors | P0 specifies stop scope, input deduplication, reconnect/readback and goal-version checks before P2 integration. |
| DEC-04 | External adapter lifecycle | Define safe cancellation, in-flight ownership, token fencing and unknown-outcome reconciliation before enabling live advice in P5. |
| DEC-05 | Contextual appraisal rules and tunables | P0 identifies bounded supported cases; P3 validates their cause/effect and contrasting scenarios. Contracts' numeric limits are proposed, not measured or doctrinal. |
| DEC-07 | Internal initiative policy | P0 defines motive/topic records, bounded fresh-topic generation, global work and contact budgets, availability and proposal lifecycle; P3 demonstrates behavior without incoming messages or pending work. No self-granted execution rights. |
| DEC-08 | Local supervision and retrieval activation | Choose Compose or systemd at P0; activate pgvector after scoped retrieval evaluation. vLLM is an optional measured scaling path, not an initial dependency. |
| DEC-06 | Source and Myanmar review | Track verified versus pending rules/labels/fixtures; full doctrine coverage remains a separate gate. |

These are explicit design tasks, not a blanket blocker for independent work. Routine technical choices consistent with approved behavior can be documented directly. A product/architecture change needs Kyaw's agreement.

## Safe resumption

Next task: execute P0 for the agreed stack against current code/SQL. Define the Temporal owner and activity/database reconciliation before building a custom scheduler; actual model/hardware evaluation remains a distinct P0 task. Start with observation identity, goal/frame/action state transitions, transaction boundaries, pending-adapter behavior and additive schema. Review F03-F05, F13, F17-F18, F21-F26 and A03-A05/A08-A10 first. Produce precise contracts/migration source before attempting P1. Do not restart the old milestone plan or treat its prescribed dependencies/folder names as authority.
