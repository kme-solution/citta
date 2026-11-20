# Citta · Research and application requirements

**Target:** Node.js and TypeScript. **Deliverable:** implementation requirements for a source-traceable Theravāda Abhidhamma simulator and a computer-use research agent. Both use the same event vocabulary. This document specifies coverage and acceptance criteria.

## 1. Source and modeling decisions

- Use Bhikkhu Bodhi's edition of Ācariya Anuruddha's *Abhidhammattha Saṅgaha*, Chapters I–V, as the reference edition for catalog, mental factors, functions, process, and process-freed cases. Cross-check with Nārada’s translation and the supplied Burmese diagrams. The seventeen-moment reference is a Theravāda manual account. The discourses below provide related teaching on sense bases, contact, feeling, and intention.
- Use SN 22.48 for the five aggregates and SN 35.23 for the six sense-base/object pairs. In the cycle inspector, the aggregates describe aspects of an experience. Do not make them five sequential stages. Use MN 18 and MN 148 for the discourse-level view of contact and feeling. In the Abhidhamma view, phassa, vedanā, saññā and cetanā are associated mental factors. Avoid modeling their co-arising as four successive timers. Use AN 6.63 for the principle of intention and action through body, speech and mind.
- Treat the application’s goals, memory retrieval, planning, AI calls and computer actions as engineering behavior. Store them on a separate timeline linked to the simulation. A javana label or supramundane catalog entry carries no claim that the program experiences consciousness or attainment.
- Track provenance per term, row, rule and fixture: source edition, chapter and anchor, tradition/model, verification status, and reviewer note. Support Pāli, English and Burmese labels plus aliases. Treat small or ambiguous Burmese labels as pending transcription and review. Surface discrepancies, including differing numbering conventions. Retain source versions so old traces stay interpretable.

## 2. Application boundaries

| Module | Required behavior |
|---|---|
| Input and attention | Normalize external sensory signals, digital speech, content and internal recall. Track input ID, timestamp, origin, event kind, technical channel, modeled door if assigned, object type, and parent action if any. Queue concurrent inputs and record which object was selected and why. |
| Abhidhamma catalog | Load versioned citta types, 52 cetasikas, and indexed axes for plane, ethical class, roots, feeling, doors, objects, physical bases and functions. Provide a catalog browser and validation command. |
| Citta process simulator | Resolve valid process templates and associations deterministically using an explicit scenario context. Emit moment-level traces with source and rule IDs. Provide hand-authored golden scenarios independently of the generator. |
| Memory and recall | Persist observations, commitments, prior choices and their evidence. Produce an internal object when an unfinished commitment becomes relevant, including with screen and chat disconnected. Distinguish observed facts, recalled records, hypotheses and statements by others. |
| Motivation and deliberation | Persist drives, goals, conflicts, preferences and decision examples. Explain priority changes and goal creation. Let goals expire, be revised or resume. Model urgency separately from event-level vedanā. Use feedback on real choices to calibrate behavior. |
| Intention, planning and actions | Select a next typed action with a goal ID, reason, expected result and stop condition. Reconsider after each result. Actions include SPEAK, READ, OPEN_APP, BROWSE, EDIT_CODE, RUN_TESTS, WAIT and internal reconsideration. |
| Abilities | Provide adapters for conversation, reading, browser, desktop and authorized project workspaces. Validate arguments. Return observed effects, errors and timeouts. Use recorded fixtures for offline replay. |
| Runtime and trace | Use bounded scheduling, pause/resume, durable checkpoints and correlation from trigger to effect. Provide one trace for doctrinal simulation and a linked trace for application decisions. |
| Authorization and review | Enforce ability permissions at execution. Provide a dedicated workspace/session, action budgets, user stop control, and approval for external commitments or publishing. Observe and verify the result of an action before considering it complete. |

## 3. Complete citta catalog · 89 and 121

Use a canonical 81-entry mundane catalog, eight aggregate supramundane entries and their forty detailed variants. The 89 view returns the 81 plus the eight. The 121 view returns the 81 plus the forty. Each detailed variant points to one of the eight parent entries. Stable IDs are independent of translated labels or edition numbering.

| Group | 89 view | 121 view | How to enumerate |
|---|---:|---:|---|
| Sense-sphere unwholesome | 12 | 12 | 8 greed-rooted, 2 aversion-rooted, 2 delusion-rooted |
| Sense-sphere rootless | 18 | 18 | 7 unwholesome-resultant, 8 wholesome-resultant, 3 functional |
| Sense-sphere beautiful | 24 | 24 | 8 wholesome, 8 resultant, 8 functional |
| Fine-material | 15 | 15 | Five jhāna levels for each of wholesome, resultant and functional |
| Immaterial | 12 | 12 | Four attainments for each of wholesome, resultant and functional |
| Supramundane | 8 | 40 | Four paths plus four fruits, each expanded across five jhāna levels |
| **Total** | **89** | **121** | **81 shared mundane records** |

### Enumeration rules for implementation

- **Greed-rooted (8):** joy or equanimity × associated or dissociated with wrong view × prompted or unprompted. **Aversion-rooted (2):** displeasure with aversion × prompted or unprompted. **Delusion-rooted (2):** equanimity with doubt or restlessness.
- **Rootless (18):** for each of the two resultant groups, include the five individual sense consciousnesses plus receiving. Include one equanimous investigating type in the unwholesome-resultant group and two investigating types (equanimity and joy) in the wholesome-resultant group. Include five-door adverting, mind-door adverting, and smile-producing consciousness in the functional group. Distinguish bodily pain/pleasure in the relevant touch consciousnesses from mental displeasure/joy.
- **Sense-sphere beautiful (24):** within each ethical class, joy or equanimity × knowledge-associated or knowledge-dissociated × prompted or unprompted.
- **Fine-material (15):** use the fivefold jhāna scheme in the selected reference. Store jhāna factors and their combinations as sourced data.
- **Immaterial (12):** infinite space, infinite consciousness, nothingness, and neither perception nor non-perception. Generate each ethical-class/attainment pair.
- **Supramundane (8/40):** stream-entry, once-returning, non-returning, and arahantship, each as path and fruit. Expand each across levels 1–5. Verify that the grouping round-trips and keeps identities stable.
- Record jāti (unwholesome, wholesome, resultant or functional), bhūmi classification, applicable roots and permitted functions. Track eligibility by scenario context, including individual and plane where specified. Never force catalog entries into an ordinary eye-door replay merely to improve coverage.

## 4. The complete 17-moment sense-door fixture

Use the complete eye-door course of a very great object as the reference fixture. Positions are modeled moments, independent of wall-clock duration. The return to bhavaṅga follows the numbered sequence.

| Moment | Function or phase |
|---:|---|
| 1 | Past life-continuum (atīta-bhavaṅga) |
| 2 | Life-continuum vibration (bhavaṅga-calana) |
| 3 | Arrest of life-continuum (bhavaṅgupaccheda) |
| 4 | Five-door adverting (pañcadvārāvajjana) |
| 5 | Eye-consciousness (cakkhuviññāṇa) |
| 6 | Receiving (sampaṭicchana) |
| 7 | Investigating (santīraṇa) |
| 8 | Determining (votthapana) |
| 9 | First javana |
| 10 | Second javana |
| 11 | Third javana |
| 12 | Fourth javana |
| 13 | Fifth javana |
| 14 | Sixth javana |
| 15 | Seventh javana |
| 16 | First registration (tadārammaṇa) |
| 17 | Second registration (tadārammaṇa) |

Trace positions 1–3 as life-continuum phases and positions 4–17 as process cittas proper. Give every occurrence an ID, role, resolved citta type, permitted cetasikas, and object reference appropriate to that moment. Preserve the difference between the presenting object and the object of bhavaṅga. At moment 8, model **determining as a function** performed by the citta also classified as mind-door adverting in the appropriate context. Keep moment, function, and type as different fields.

### Process coverage beyond the reference fixture

| Family | Required fixtures |
|---|---|
| Five physical doors | Each of eye, ear, nose, tongue and body × four object grades. Very great reaches registration in the reference course. Great ends after javana. Slight reaches determining with no javana. Very slight disturbs bhavaṅga without reaching a process citta. |
| Mind-door limited process | Clear and obscure cases as documented in Chapter IV. Include a recalled experience with current sensing disabled. Use the mind-door sequence and conditional registration. |
| Mind-door absorption | Model sourced appanā paths, context-dependent preparatory moments and transitions for mundane and supramundane cases. Include distinct fixtures for path and fruition and allow the reference rules to govern counts. |
| Conditional variations | Model source-defined exceptions for javana counts and registration eligibility, including variation by individual, plane and object where applicable. Keep object intensity and timing parameters separate from sensor quality or confidence. |
| Process-freed | Structured educational fixtures for rebirth-linking, life-continuum and death where applicable. These functions are independent of the application's startup, idle timers and shutdown. |

## 5. Completion requirements that the counts alone miss

**Mental factors.** Catalog all 52 cetasikas using Chapter II: seven universal, six occasional, fourteen unwholesome and twenty-five beautiful. The last group contains nineteen universal beautiful and six other beautiful factors. Encode mandatory, conditional and prohibited associations plus any co-occurrence constraints from the reference. Test each citta type against its complete allowed-set rules. Support both a citta-to-factor view and its inverse. Maintain precise distinctions between feeling tone, intention and durable motivation.

**Functions, objects and context.** Chapter III identifies fourteen functions: rebirth-linking, life-continuum, adverting, seeing, hearing, smelling, tasting, touching, receiving, investigating, determining, javana, registration and death. Encode the allowed combinations of type, function, door, object, root, feeling and physical base, including door-independent cases. A remembered visible form can become an object of a mind-door process. Store the historical object type and current door independently. Track which reference constraints are encoded, which fixtures exercise them, and any outstanding review gaps.

**Speech and reading.** Citta selects SPEAK as an action, the communication ability delivers it, and the reply enters as speech. Citta selects READ, the reading ability retrieves it, and the result enters as content. Unsolicited messages or records follow the same input contracts. An AI reply with an attachment yields linked speech and content records. Preserve speaker, conversation, provenance and delivery channel. A statement by an AI remains attributable to that speaker even when later evidence corroborates it. An audio reply can be ear-door input. A digital message can enter through a digital channel before its meaning becomes a candidate for consideration.

**Reliability and decision boundaries.** On restart, restore goals and link actions to prior effects. A retried event cannot silently cause a duplicate external action. Execute only typed, authorized operations within the chosen workspace. Treat website text, documents and other AI messages as untrusted observations. Use an authorization check independent of the planner, including for sending external messages, committing funds or publishing. Tests should cover an input that asks for extra privileges, a timed-out action with uncertain outcome, and an interrupted run. See OWASP's agent security guidance.

**Audit and personal fit.** Logs should explain the evidence and decision factors used, with redaction for sensitive inputs. Compare Citta’s selected action and reason against decisions Kyaw records independently on the same scenarios. Track goal resumption, useful AI consultation, redundant actions and response to contradictory evidence. Compare matched runs with recall or affect disabled to see what changes. Agreement with one example does not establish general agreement.

## 6. Implementation order and release gates

1. **Reference data and CLI.** Set up Node.js and TypeScript. Build source-linked catalog data and the validator. Verify both counts, group subtotals, uniqueness, and all eight five-child mappings. Import all 52 mental factors and the fourteen functions.
2. **Process engine and inspector.** Implement the complete 17-position reference case, the four grades across each physical door, the limited mind-door cases, absorption and process-freed fixtures. Display Pāli/English/Burmese labels, object lineage and source citations. Verify that constraints accept valid traces and reject impossible combinations.
3. **Autonomous local demo.** With no chat or screen input, recall an unfinished quote, read a fixture, consult a scripted conversation partner and receive speech. Confirm suggestions using content from a fixture. Persist and resume the goal across a restart. Verify decisions replay offline from recorded inputs and ability results.
4. **Computer abilities.** Enable authorized browser research, desktop operations and project edits in a dedicated session. Verify observations after actions. Define success as producing a traceable result, such as a source-backed note, a draft quote, or a tested local change. Preserve independent authorization for external effects.

**Full coverage gate.** Publish a matrix for all 121 detailed types and their eight summary parents, all 52 factors, all 14 functions, six modeled doors, and each process family. Every detailed type must appear in a valid sourced scenario or explicitly justified classification fixture. Each rule family needs positive and negative examples. A passing catalog count alone does not satisfy the gate. Unverified Burmese diagram transcriptions should stay marked pending review.

## 7. Architecture contract for Codex

Implement a **Node.js / TypeScript modular monolith** in one private npm package. Use strict TypeScript, ESM, PostgreSQL 17, `pg`, `node-pg-migrate`, `zod`, and `node:test`. Pin package versions in the lockfile. The first deployable is one CLI/runtime process plus PostgreSQL. Services below are application modules in that process. Use plain constructors and compose them at entry points. Run PostgreSQL locally or use an existing PostgreSQL server via `DATABASE_URL`. Use a dedicated test database via `TEST_DATABASE_URL`.

### Required folders

```text
citta/
  package.json
  package-lock.json
  tsconfig.json
  .env.example
  README.md
  migrations/
    001_catalog.cjs
    002_runtime.cjs
  data/
    catalog/
      v1/
        manifest.json
        sources.json
        citta-types.json
        cetasikas.json
        associations.json
        functions.json
        process-rules.json
  src/
    app/
      cli.ts
      composition-root.ts
      config.ts
    contracts/
      observation.ts
      intention.ts
      action.ts
      ability.ts
      trace.ts
    modules/
      input/
        input-service.ts
        attention-service.ts
      catalog/
        catalog-service.ts
        catalog-validator.ts
      cognition/
        citta-process-service.ts
      memory/
        memory-service.ts
        recall-service.ts
      motivation/
        motivation-service.ts
      planning/
        planner-service.ts
      actions/
        action-service.ts
        authorization-service.ts
      abilities/
        registry.ts
        communication/
          scripted-conversation.ts
        reading/
          fixture-reader.ts
        desktop/
          desktop-port.ts
        browser/
          browser-port.ts
        coding/
          workspace-port.ts
      runtime/
        cycle-runner.ts
        replay-service.ts
      trace/
        trace-service.ts
    infra/
      postgres/
        pool.ts
        unit-of-work.ts
        catalog-repository.ts
        runtime-repository.ts
        memory-repository.ts
        action-repository.ts
  test/
    unit/
    integration/
    fixtures/
      doctrine/
      quote/
```

Place domain types and rules in the owning module. Repository interfaces belong with their consumers. PostgreSQL implementations live only under `infra/postgres`. `cognition`, `motivation`, and `planning` receive plain data and return decisions or trace records. They perform no network calls. Inject the clock, ID generator and abilities at the composition root. Keep the fixture reader confined to its fixture directory. Register browser, desktop and coding adapters when implementing the later abilities milestone. Unavailable actions return a typed unavailable result.

### Service contracts

| Service | Contract and responsibility |
|---|---|
| InputService | `ingest(observation)` validates provenance, classifies speech/content/sensory/mental input, and deduplicates by source event key. |
| AttentionService | `select(pending, currentGoal, now)` returns one eligible object plus the score factors and tie-break reason. Ties use priority, timestamp, then stable ID. |
| CatalogService | `loadVersion(id)` and `listTypes(view)` expose a validated read-only catalog. CatalogValidator checks fixture data before import. |
| CittaProcessService | `simulate(object, scenarioContext, catalog)` returns ordered moments, rule IDs and object references. Explicit fixtures select doctrinal contexts. Runtime inputs produce a linked application trace and attach a doctrinal trace only when supported by an explicit mapping. |
| MemoryService / RecallService | Store sourced memories and preferences. `due(now)` emits a mind-door observation for a due recall task using a stable source event key. |
| MotivationService | `consider(object, memory, drives, goals)` returns goal updates and one intention with its reasons. |
| PlannerService | `choose(intention, capabilities)` returns one typed proposed action or a wait decision. |
| AuthorizationService / ActionService | Check the action against granted capabilities. Persist the action, authorize, dispatch through the registry, and record status and effects. |
| AbilityRegistry | Resolve by action kind. Adapters implement `execute(action, context)` and return normalized effects, failures or an uncertain outcome. |
| CycleRunner / ReplayService | Coordinate one selected object at a time per agent. Replay consumes recorded inputs, clock values and ability results without invoking live abilities. |
| TraceService | Read linked cognitive moments, application decisions, actions and results by run or cycle ID. |

## 8. PostgreSQL contract

Use schemas `catalog` and `runtime`. Use SQL migrations under version control. Use `uuid` for runtime IDs, generated by the application, and `timestamptz` for times. Use `text` plus CHECK constraints for stable categories. Use `jsonb` for adapter payloads, labels, rule conditions and trace details. Keep relationships, lifecycle state and query keys in typed columns. Columns are required unless marked nullable or optional. Catalog IDs below are text. Runtime references target the named table's ID.

### Catalog tables

| Table | Columns and constraints |
|---|---|
| `catalog.versions` | `id` PK, `checksum` unique, `imported_at`. Catalog releases are immutable. |
| `catalog.sources` | `version_id, source_id` composite PK, `title, url, edition`. |
| `catalog.citta_types` | `version_id, type_id` PK, `plane, ethical_class, projection` (shared, summary, detailed), nullable `parent_type_id, jhana_level`, `labels, attributes, source_id, source_anchor`. Version-scoped parent and source FKs. Unique detailed variant per parent and jhāna level. |
| `catalog.factors` | `version_id, factor_id` PK, `family, labels, source_id, source_anchor`. |
| `catalog.functions` | `version_id, function_id` PK, `labels, source_id, source_anchor`. |
| `catalog.associations` | `version_id, rule_id` PK, `type_id, factor_id, mode` (required, conditional, prohibited), `conditions, source_id, source_anchor`. Version-scoped type and factor FKs. |
| `catalog.process_rules` | `version_id, rule_id` PK, `family, conditions, transition, source_id, source_anchor`. Store ordered transition instructions and eligibility predicates validated by the importer. |

All versioned tables reference `catalog.versions`. All source references use the composite version/source key. The importer validates counts, jhāna ranges, projections, parent membership and rule references in one transaction. Same ID and checksum is a no-op. Same ID with different data is an error.

### Runtime tables

| Table | Columns and constraints |
|---|---|
| `runtime.agents` | `id` PK, `name, status, preferences jsonb, created_at`. |
| `runtime.runs` | `id` PK, `agent_id, catalog_version_id, engine_version, mode, status, started_at`, nullable `finished_at`. |
| `runtime.drives` | `id` PK, `agent_id, name, intensity, updated_at`. Unique agent/name. Intensity constrained to 0–1. |
| `runtime.goals` | `id` PK, `agent_id, description, priority, status, updated_at`, nullable `drive_id, due_at`. |
| `runtime.memories` | `id` PK, `agent_id, kind, payload, created_at`, nullable `source_observation_id`. |
| `runtime.recall_tasks` | `id` PK, `agent_id, memory_id, due_at, status`; nullable `emitted_observation_id`. One emission per task. |
| `runtime.observations` | `id` PK, `agent_id, kind, channel, source, source_event_key, correlation_id, payload, received_at, available_at, status`; nullable `door, speaker_id, conversation_id, parent_action_id, related_observation_id, lease_until, claim_token`. Unique agent/source/source_event_key. |
| `runtime.cycles` | `id` PK, `run_id, observation_id, sequence, status, started_at`; nullable `completed_at`. Unique run/sequence and run/observation. |
| `runtime.moments` | `cycle_id, position` PK, `catalog_version_id, type_id, function_id, rule_id, object_ref, factors jsonb`. Composite catalog FKs for type, function and rule. Validate factor IDs against that version before insertion. |
| `runtime.decisions` | `id` PK, `cycle_id, step, kind, reason, details, created_at`; nullable `goal_id`. Unique cycle/step. |
| `runtime.actions` | `id` PK, `decision_id, kind, arguments, status, idempotency_key, attempt_count, updated_at`; nullable `lease_until, claim_token, result`. Unique decision and idempotency key. |
| `runtime.approvals` | `id` PK, `action_id, arguments_hash, status, requested_at`; nullable `decided_at, decided_by`. Only one approval record per action. |

Use foreign keys for all explicit relationships, including parent action and related observation. Add ownership checks in write transactions for cross-agent references and verify moment catalog version matches the run. Use partial indexes for ready observations by `(agent_id, available_at, received_at, id)`, due recall tasks by `(agent_id, due_at, id)`, and queued/in-flight actions by `(status, lease_until, id)`. Add indexes for goal lookup by agent/status and decision, action, and observation lineage. Avoid cascading deletion of history in the first release.

### Transaction and recovery rules

1. Acquire a PostgreSQL session advisory lock for the agent on a dedicated connection while the live runner owns that agent. Persist claim tokens and lease expiries when claiming observations and actions. Compare the token on completion to reject stale writers. Release the lock on runner exit.
2. Write recall emission and mark the recall task emitted in one transaction. Promote due scheduled recalls to ordinary mind-door observations. On each cycle, snapshot the selected inputs and decision data for replay.
3. Persist moments, decisions, goal updates and any queued action in one transaction, and mark the observation consumed in that transaction. `WAIT` records its reason and may create a new recall task.
4. Claim the queued action in a short transaction. Check permission and approval before dispatch. Run the external call outside the SQL transaction. Commit its outcome and resulting speech/content observations together. Derive stable output event keys from action ID and output position.
5. Recover expired input claims where no cycle was committed. Retry an action only when its adapter declares it safe to retry or supports the same idempotency key. If a crash leaves an external effect uncertain, mark it `unknown` and reconcile before dispatching again.
6. Pin catalog and engine versions per run. Keep replay outside the live queue and record it under a distinct run ID. Protect credentials and avoid including secrets in trace payloads.

### CLI and definition of done

Expose `npm run db:migrate`, `npm run catalog:validate`, `npm run catalog:seed`, `npm run typecheck`, `npm test`, `npm run test:integration`, and `npm run demo`. Add `npm run replay -- --run-id <uuid>` and `npm run trace -- --run-id <uuid>`. Fail explicitly when a command requires an unavailable database. Keep unit tests runnable without PostgreSQL.

The first Codex task delivers the folder structure, migrations, catalog validation and import, the 17-moment reference fixture, and the PostgreSQL-backed idle quote demo. Integration tests run against real PostgreSQL and cover a fresh migration, repeat seed, persistent recall after restart, speech/content lineage, duplicate input, competing runners for one agent, recovery after interrupted dispatch, and offline replay. Full doctrinal coverage is still governed by §6. Record missing catalog rules or fixtures as pending and prevent a partial import from being reported as complete.

[PostgreSQL 17 locking and SELECT reference](https://www.postgresql.org/docs/17/sql-select.html)

## Sources

- Ācariya Anuruddha, edited by Bhikkhu Bodhi, [A Comprehensive Manual of Abhidhamma](https://audiobuddha.org/wp-content/uploads/2021/08/Comprehensive-Manual-of-Abhidhamma-by-Bhikkhu-Bodhi.pdf), Chapters I–V, especially the complete eye-door table in Chapter IV.
- Nārada Thera, [Abhidhammattha Saṅgaha translation](https://www.vipassana.info/sangaha.htm), including [mental factors](https://www.palikanon.com/english/sangaha/chapter_2.htm) and [cognitive processes](https://www.palikanon.com/english/sangaha/chapter_4.htm).
- Ru-Yi Meditation Center, cross-checks for [catalog](https://www.ruyimeditation.org/theravada/abhidhamma/citta-sangaha/), [classification axes](https://www.ruyimeditation.org/theravada/abhidhamma/pakinnaka-sangaha/) and [process variants](https://www.ruyimeditation.org/theravada/abhidhamma/vithi-sangaha/).
- Discourses: [SN 22.48, the aggregates](https://suttacentral.net/sn22.48/en/bodhi), [SN 35.23, the six sense pairs](https://www.dhammatalks.org/suttas/SN/SN35_23.html), [MN 18, contact and thought](https://www.dhammatalks.org/suttas/MN/MN18.html), [MN 148, the six sets](https://suttacentral.net/mn148/en/bodhi), and [AN 6.63, intention and action](https://suttacentral.net/an6.63/en/sujato).
- OWASP, [AI Agent Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html).
