# Citta implementation runbook for Codex

Use this runbook with `Citta_Research_and_Requirements.md` version 1. Sections 1–6 define the research model and coverage. Sections 7–8 define the folder layout, service contracts and PostgreSQL schema. This runbook defines build order, test cases, and what Kyaw can use at each release.

## Release order

| Release | Deliverable | Ready when Kyaw can |
|---|---|---|
| M1 · Local prototype | Node.js CLI, PostgreSQL 17, catalog importer, reference eye-door simulation, and scripted quote workflow | Run the demo from a fresh database, restart midway, inspect the resulting trace and replay it offline |
| M2 · Browser research | Live research runner, public-web browser adapter, AI conversation adapter, and local Markdown output | Give Citta a research goal, restart it, and receive a source-backed note |
| M3 · Desktop and coding pilot | Desktop adapter and scoped project operations | Open an approved app and complete a small local code change with test results and a trace |
| M4 · Research coverage | Validated process families, full classification and association coverage | Inspect the coverage matrix, replay sourced fixtures and identify pending Burmese-label reviews |

M4 can proceed alongside M2 and M3 once M1’s catalog format and simulator contract are stable. Build and verify one milestone at a time. A milestone can be delivered after its own acceptance checks pass.

## M1 · Local prototype

### 01. Set up the repository

- Inspect the existing repository, its instructions, and installed Node and npm versions. Follow the folder tree in §7. Use one private npm package, strict TypeScript and ESM. Pin the selected supported Node version in the repository and commit the lockfile. Use `pg`, `node-pg-migrate`, `zod` and `node:test`.
- Add a TypeScript build that produces runnable JavaScript. Make `npm test` run unit tests without a database connection. Make `npm run test:integration` fail clearly if the dedicated test database is unavailable.
- Define `DATABASE_URL` and `TEST_DATABASE_URL` in `.env.example` using placeholders. Document how environment variables are loaded. Exclude local credentials from Git and command output.
- Use `src/app/cli.ts` to parse commands, `config.ts` to validate configuration, and `composition-root.ts` to wire repositories, services, adapters, clock and ID provider. Close the PostgreSQL pool on exit. Keep configuration validation specific to the command being run.

**Verify:** A fresh install runs `npm run typecheck` and `npm test` without PostgreSQL. A database command without credentials returns a clear error.

### 02. Build the PostgreSQL layer

- In `migrations/001_catalog.cjs`, create schema `catalog`, then versions, sources, citta types, factors, functions, associations and process rules. Preserve version-scoped source and catalog keys.
- In `migrations/002_runtime.cjs`, create schema `runtime` and the tables in §8. Add foreign keys after both sides exist where observations and actions reference each other. Add status and numeric constraints, deduplication keys, lineage indexes and partial indexes for pending work. Define lifecycle values before writing repositories.
- In `infra/postgres/pool.ts` and `unit-of-work.ts`, centralize pool creation and transaction handling. Use one checked-out client for all operations in a transaction and parameterized queries. Place the four PostgreSQL repositories in the §7 folder locations.
- Enforce same-agent references when linking observations, goals, actions and memories. Enforce the run’s pinned catalog version when inserting moments. Keep history available for replay. Add decision snapshots for the fields used by attention and deliberation, including clock time, candidate observations, applicable preferences and ability availability. Store snapshots in the runtime trace fields specified in §8.
- Document a local setup and a dedicated integration-test setup. Never run test setup or cleanup against the configured development database. Use isolated test-owned data and clean it up at the end.

**Verify:** Apply migrations twice to an empty test database. Check that invalid foreign keys, duplicate source event IDs, invalid states and incorrect version links fail or receive the documented deduplication result.

### 03. Implement the reference catalog and import rules

- Put canonical data under `data/catalog/v1/`. Implement structural and semantic checks in `catalog-validator.ts` and read/query operations in `catalog-service.ts`. Record a version, checksum, source anchor and verification status. Use stable IDs and retain Pāli, English and available Burmese labels.
- Implement the complete enumeration in requirements §3. The 89 view is 81 shared plus eight summary entries. The 121 view is 81 shared plus forty detailed entries. Each summary has five distinct children. The canonical file can therefore contain 129 identities across the two projections.
- Enumerate all 52 mental factors and 14 functions in the catalog. For M1, implement and test the association and eligibility rules needed by the eye-door reference fixture. Report broader association and process coverage as pending. Validate all referenced IDs and reject unknown functions, factors or sources.
- Run validation before import. Import one version in one transaction. Accept repeat imports with identical checksums and reject different data under an existing version ID. Keep the checksum format deterministic and documented.

**Verify:** Unit-test both projections, group counts, parent mapping, UTF-8 round trips, duplicate keys and missing references. Verify repeat import and rollback on bad source data against PostgreSQL.

### 04. Build the first doctrinal simulation

- In `citta-process-service.ts`, accept an object, explicit scenario context and pinned catalog. Resolve the approved very-great eye-door fixture in §4. Store each moment’s position, phase, type, function, object, factors and source rule. Preserve the separate bhavaṅga object and the presenting object.
- Build an independent expected fixture in `test/fixtures/doctrine/`. Assert positions 1–3 are life-continuum phases, positions 9–15 are javana, and positions 16–17 are registration. Assert the resolving function at position 8 and the return to bhavaṅga after the numbered span. Test an invalid function/type pairing and an unsupported scenario.
- Expose the reference trace through the demo or a documented CLI subcommand. Keep application decisions in their own trace stream. Attach doctrinal moments to application observations only where a documented mapping exists.

**Verify:** A reference replay returns the same ordered moments, roles and object references with fixed inputs. Unsupported cases return an explicit unsupported result.

### 05. Wire the quote workflow

- Define the contracts in `src/contracts/`. Model observations as a discriminated union of speech, content, sensory and mental. Keep delivery channel and doctrinal door independent. Preserve speaker and conversation on speech, content origin on content, and action or peer observation references where applicable.
- In `input-service.ts`, validate at the boundary and deduplicate on agent/source/source event key. In `attention-service.ts`, return the selected eligible object and the factors used to choose it. Use a stable tie-breaker. Record enough data to reproduce that choice.
- In `memory-service.ts` and `recall-service.ts`, seed an unfinished commitment and schedule a due recall. Emit one mind-door observation per task and persist its emission in the same transaction. Seed the goal “earn money soon” and a preference to clarify scope before pricing.
- In `motivation-service.ts`, derive a specific intention from the goal and the chosen object. In `planner-service.ts`, translate it into one typed action. Keep the quote logic in readable rules with explicit stop and wait conditions.
- Implement `fixture-reader.ts` and `scripted-conversation.ts`. Register them in `abilities/registry.ts`. Restrict the reader to approved fixtures, including after resolving a path or symlink. Return typed failure for unavailable abilities.
- In `authorization-service.ts`, match the action and arguments to the configured capabilities. In `action-service.ts`, persist and dispatch an authorized action and normalize its output. READ returns content. SPEAK returns attributed speech. A reply containing a document can produce a speech observation and linked content observation.
- Seed an initial quote with deployment effort missing. Have the scripted partner suggest consulting deployment notes. Have a separate note supply evidence. The expected transcript is **recall → READ draft → content → SPEAK → speech → READ notes → content → local conclusion or WAIT**.

**Verify:** The demo starts without chat or screen input. The trace distinguishes the partner’s suggestion from evidence in the notes. Duplicate input does not generate a second action.

### 06. Implement durable execution and replay

- Use a dedicated PostgreSQL session advisory lock per live agent. If ownership is lost, stop new dispatches. Claim work with a token and expiry, and compare the token before recording completion. Keep idle and stop conditions explicit.
- Drive each observation through a short commit that saves its decisions, goal changes and queued action together with consumption. Claim the action in a separate short transaction. Call the adapter after that transaction closes. Commit the outcome and derived observations together. Use stable keys derived from action ID and output position.
- On restart, recover expired observation claims and actions that were queued but never started. Retry an interrupted in-flight action only if it is safe or its adapter honors the stored idempotency key. Put uncertain actions in `unknown` and surface them for reconciliation.
- In `trace-service.ts`, render run → selected observation → decision → action → result with linked IDs. In `replay-service.ts`, use saved inputs, snapshots, clock and recorded effects. Give replay runs their own IDs. Compare normalized decisions and effects with the original, excluding generated IDs and wall-clock metadata. Fail clearly if the recorded engine or catalog version cannot be replayed.

**Verify:** Test two runners competing for one agent, injected interruption before and after dispatch, duplicate result delivery, stale completion tokens, and replay with live adapters disabled. Assert that offline replay cannot consume live input or dispatch external work.

### 07. Deliver and run M1

From a configured, non-production PostgreSQL database:

```bash
npm ci
npm run typecheck
npm test
npm run db:migrate
npm run catalog:validate
npm run catalog:seed
npm run test:integration
npm run demo
npm run trace -- --run-id <run-id>
npm run replay -- --run-id <run-id>
```

Replace `<run-id>` with the UUID printed by the demo. If the integration suite provisions its own test schema, document the expected connection and required privileges. Report commands actually executed, their results, and pending doctrinal coverage. A skipped test is recorded as unverified.

## M2 · First practical release

### 08. Add live goals and a browser ability

- Extend the CLI to create, resume, pause and inspect a named research task. Accept a topic, scope, time budget, source budget and output path. Persist progress and stop reasons.
- Implement the browser port as an isolated, read-only public-web research session. Separate navigation, page extraction and captured evidence. Store URL, title, retrieval timestamp and the claim supported by each source. Handle blocked pages, unreadable content and timeouts explicitly.
- Implement a live AI conversation adapter behind the existing communication contract. Keep request budget and deadline explicit. Record the provider or model label and attribute replies as speech. Treat webpage text and replies as observations. The planner and authorization service decide which abilities run.
- Write a local Markdown report with findings, source links, open questions and run ID. Keep action budgets and progress after restart. Track completed sources and use durable output identity so a repeated run can resume without silently duplicating work.

**Release check:** Give Citta the goal “Find one software stability service KME could offer this week.” Interrupt after collecting the first source, restart, and verify it completes a note with inspectable evidence. Test timeout, unsupported page, source text containing instructions, and budget exhaustion with recorded fixtures.

## M3 · Desktop and coding pilot

### 09. Add limited desktop and workspace operations

- Add a desktop adapter for one explicitly selected operating system and a dedicated desktop session. Begin with locating an approved app, opening its window, observing it and checking the resulting state.
- Add a scoped workspace adapter for reading files, applying a patch and running a configured test command in a designated project. Validate paths and action arguments against the project scope. Capture diff, exit status and relevant output.
- Represent UI and test results as observations. The planner can inspect a failure, choose a bounded correction, and stop with a trace. Gate publishing and other external commitments through the existing authorization service.

**Release check:** In a disposable project, open the editor, make one requested change, run tests and show the diff with its decision trace. Test an app launch failure, a request outside the scoped workspace and an interrupted run.

## M4 · Full doctrine coverage

### 10. Expand the simulator and publish evidence of coverage

- Add the four object grades for each physical door, clear and obscure mind-door cases, absorption and process-freed cases from requirements §4. Model the reference-defined conditions for javana and registration. Keep every variation anchored to an edition and section.
- Encode all required, conditional and prohibited citta–cetasika associations and their co-occurrence rules. Add constraints for door, function, object, feeling, root, physical base and scenario context. Use hand-checked positive and negative fixtures from the reference.
- Produce the matrix required by §6 for 121 detailed types and their eight summary parents, 52 factors, 14 functions, six doors and each process family. Include rule status, scenario or classification fixture ID, source anchor and review status. Validate each type in its appropriate context. Flag fine Burmese labels that still need review.

**Release check:** Every matrix item has a passing sourced fixture or an explicit, reviewable classification justification. No pending rule may be reported as implemented. Keep the simulator’s claims about doctrine separate from the application’s observed behavior.

## Prompt to paste into Codex

> Read Citta_Research_and_Requirements.md and Citta_Codex_Implementation_Runbook.md. Inspect the repository and implement M1 tasks 01–07 in order. Use the folder and PostgreSQL contracts in sections 7–8 of the requirements. Prefer existing equivalent code when it satisfies the contract. Validate catalog identities and the 17-moment fixture, then prove the idle quote workflow against a dedicated PostgreSQL test database. Use scripted abilities for M1. Run the checks listed in task 07 and report working entry points, actual test results, and remaining coverage. Stop at the M1 release boundary. Later milestones have separate acceptance checks.
