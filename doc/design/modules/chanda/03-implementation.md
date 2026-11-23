# Chanda (ဆန္ဒ) — coding and implementation design

**State:** documentation and read-only source assessment; proposed changes are not implemented by this file. Behavioral authority is the [digital model](02-digital-model.md); research belongs to the [Myanmar explanation](01-buddhist-explanation.md). Application execution requires the existing explicit-authorization gate.

## Current code and gap

`chanda-service.ts` has a legacy recalls/3 curiosity threshold. `eligibility.ts` computes engineering delay/backoff; `focus.ts` owns SQL for continuing concern selection, advancement and validity. `vithi/cycle.ts` constructs internal cues and consults budgets. These are useful mechanisms but not a complete desire model.

## Proposed record and interfaces

Preserve existing motives, motive_contexts and focuses, but specify separate Interest, CandidateConcern and RetainedFocus contracts. Add versioned origin/reference metadata only where absent; do not reset records. Model a return condition and source validity explicitly. No desire score should be inferred from recall count alone.

## Integration and state transitions

Retrieve eligible interests and sources under one agent lock; vithi selects an opportunity; manasikara binds the object; cetana adopts a direction. Focus advancement records actual progress or justified status changes. Sati can supply new associations without promoting them to operator priorities. Proactive contact still passes its separate policy.

## Failure, recovery and compatibility

Invalidated source or cancelled source task prevents blind resumption. Unknown effects cannot become a new motive that bypasses blocked dispatch. Same-context repetition is a signal to review progress, not proof of learning. Keep current continuous-mode eligibility without adding an unapproved arbitrary idle cutoff.

## Delivery slices and verification gates

1. Separate legacy threshold demo, eligibility policy and retained-concern contracts.
2. Clarify provenance and deliberate return/release transitions without replacing agent memory.
3. Verify idle initiative, repeated-topic review, interruption and no-budget-bypass behavior through real context.

Acceptance is defined by CH-01 onward and the CH-C scenarios in document 02. When execution is authorized, start with meaningful focused checks, then isolated persistence/integration checks where needed, then actual provider/portal observation for semantic behavior. Catalog-only checks should inspect authoritative data and representative classifications. Never claim a runtime outcome from this source review.

No application source, dependency, migration or running service is changed by this documentation. Keep historical records, private configuration and applied migration checksums intact. Proposed API/schema changes require explicit compatibility and version handling in their implementation slice. Actual completion, limitations and the next safe task remain in the existing delivery status document.

## Explicit interest and ambition configuration slice

Add `CITTA_INTERESTS` and `CITTA_AMBITIONS` as JSON arrays. Each entry has a stable lowercase `id`, a display `name` and `description`; ambition entries additionally require `successCriterion`. Configuration is operator-supplied context, never executable permission or verified progress. Accept at most eight entries per list, reject unknown keys/duplicates/empty or oversized fields, and preserve Unicode display text. An omitted setting preserves legacy defaults / `CITTA_GOALS` aspiration; an explicit empty array disables that configuration-owned class without deleting history or self-proposed interests.

Use existing motive storage with stable names `interest:<id>` / `ambition:<id>` and explicit origins `configured-interest` / `configured-ambition`. Persist a readable description containing the display name and, for ambition, its operator criterion. Do not pretend this adds milestones, income tracking or autonomous planning. Initialization updates only matching configuration-owned records, increments versions only on real changes and disables removed managed entries without deleting their focus/history. A name collision with a non-owned record must fail rather than silently overwrite it. Default/legacy aspiration rows remain compatible when new settings are omitted; explicit settings supersede their respective configured defaults.

Keep full motive provenance and description in existing internal consideration context; ambition criteria are context for choosing a useful direction, not proof of meeting any task criterion. Mind separates ambitions from interests with clear empty/disabled states. Configured identifiers remain stable across display-name edits. No database migration is necessary for this configuration-only slice; new structured planning/persistence remains separate work.

Private environment values must not be invented from generic examples. Preserve existing ambition and interests unless Kyaw provides alternatives. New source remains unverified until explicit execution authorization; configuration changes are activated by a coordinated restart, not a live silent mutation.

Configuration changes must fence derived work: block active/deferred focus episodes tied to changed or disabled managed motives, preserving history. At action claim, reject an obsolete/disabled motive snapshot before any effect. Explicit ambitions supersede the legacy profile goal text for current configuration; omitting the setting preserves the legacy profile. Display achieved/progress status only when actual evidence exists; a configured success criterion is not a verified outcome. Initial scope is configuration and readback, not a planning engine.

### Motive version versus turn accounting

Motive `version` is a semantic/configuration fence: description, authority/provenance or enabled-state changes invalidate old candidates. Incrementing `turns` alone must not increment that fence after a candidate snapshot is captured. Otherwise every internally queued action rejects its own unchanged source before dispatch. Keep the independent current-enabled/version check; fix accounting rather than weakening source validation. Previously denied operations remain truthful history and are not automatically redispatched.

### Conversation-led follow-up

Prefer newer actionable conversation concerns over unrelated retained curiosity while preserving the displaced return point. Permit a bounded review of substantial completed operator work (at least three cycles and real non-INFER work or at least two attributable operator contributions), with original source version/update lineage and no task reopening. A completed source with an already recorded review for its current update marker does not generate repeated fresh review episodes. Keep the source conversation on internal observations and include its retained criterion/outcome plus actual operation feedback in context. Existing source validity/unknown-effect and controls still fence action.
