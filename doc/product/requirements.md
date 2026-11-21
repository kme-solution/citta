# Citta product requirements

**Basis:** Kyaw's approved [architecture](../design/architecture.md) and [behavior flows](../design/behavior-flows.md). **Target:** a continuing agent with conventional identity, memory, commitments, one foreground stream, contextual appraisal and accountable action. It is not a message router with an external model acting as its controller.

## Required outcomes

| ID | Requirement | Design evidence |
|---|---|---|
| REQ-01 | Maintain one selected foreground object and one state-changing decision writer per agent; concurrent input/results enter queues | A01, A05; F01-F02; S11-S12, S37 |
| REQ-02 | Attend to a new message, checkpoint unfinished work, respond, reconcile and resume without forgetting, repeating effects or resetting budgets | A05; F03-F05; W01, W03; S02, S07-S12 |
| REQ-03 | Use an explicit versioned name/background as Citta's conventional first-person identity; unknown attributes remain unknown; chat/AI cannot silently rewrite it | A02-A03; F06, F20; S03, S39 |
| REQ-04 | Preserve observations, sourced memories, interpretations and beliefs separately, with agent/conversation scope and correction history | A03; F06-F07, F20; S04, S09-S10, S27, S30, S38 |
| REQ-05 | Maintain evidence-backed goals and success criteria, due recalls, bounded initiative and visible waiting/stop reasons even without browser input | A03, A05; F05, F16; S20, S24, S32-S33, S36-S37 |
| REQ-06 | Model contextual feeling tone, reaction tendency and reflection separately; affect can influence choices but never override truth, permissions or stop controls | A02, A06; F08-F11; S13-S26, S41-S42; W02 |
| REQ-07 | Consider sufficient local actions before external advice. Consultation needs an explicit gap or requested adviser role, granted scope and remaining budget | A01-A02; F11-F14; S01-S06, S25, S29-S31 |
| REQ-08 | Treat external advice as attributed speech, inspect relevant evidence and report unsupported claims honestly; returning text does not complete a goal | A03-A04; F14-F15, F19; S14, S27-S29 |
| REQ-09 | Persist typed actions before dispatch, authorize independently, observe actual effects and review them against expected outcomes | A04; F13, F15; S25-S26, S30-S31, S40 |
| REQ-10 | Preserve cancellation/corrections, reject stale completions, deduplicate retries and reconcile uncertain effects before retry | A03-A05; F17-F18; S08-S12, S28, S34-S36; W03 |
| REQ-11 | Replay recorded inputs/context/effects offline without consuming live work or invoking external abilities | A07; F18; interruption/affect replay acceptance in the plan |
| REQ-12 | Show durable conversation, selected/suspended commitments, actual action states, attribution and control outcomes in an accessible local portal | A01, A05; F03-F05, F19; S02, S07-S12, S33 |
| REQ-13 | Maintain sourced doctrinal catalogs/process fixtures separately from application decisions; link only through explicit supported mappings | A06; source/model reference |
| REQ-14 | Make decisions, memory provenance, modeled affect, feedback and limitations inspectable; never fabricate internal experience or verification | A03, A06-A07; F06, F08-F10, F15, F19-F20 |
| REQ-15 | Originate a fresh thought/topic/activity from persistent interests, memories, desires or ambitions even with no incoming message, pending task or unfinished commitment | A08; F21-F22, F25-F26; S43-S46, S56-S58; W04 |
| REQ-16 | Initiate appropriate local conversation from a relevant idea, shared interest or question; respect availability, silence and declined topics | A09; F23; S47-S51, S59; W05 |
| REQ-17 | Notice capability opportunities/limitations and form evidence-backed improvement proposals; executable self-changes require separately authorized capabilities | A09; F24; S52-S55, S59; W06 |
| REQ-18 | Persist/replay motives, internally chosen topics and outgoing initiative, with shared foreground ownership, global budgets and stop controls | A08-A09; F21-F26; S56-S60 |

## First development boundary

Deliver the bounded continuing-runtime capabilities above with validated model-assisted interpretation and deterministic execution constraints, a sufficient-local-evidence quote case and a justified-advice variant. Include fresh internally originated topics, bounded exploration and proactive local conversation even when no work is pending. Self-improvement reaches a reviewable proposal in this delivery; executable code/model upgrades remain a separately authorized future adapter. Demonstrate interruption while an ability is pending before enabling live advice. Preserve existing reference commands and stored notes during transition.

Unrestricted human-like language understanding is not implied by these tasks. If an interpreter cannot resolve a message, ask for clarification or state the limitation. Ollama local model-assisted cognition is agreed, but actual model selection, hardware and English/Myanmar capability require evaluation. Codex is an optional external adviser. Both involve AI; the requirement is conditional external consultation, not AI-free ordinary cognition.

Future capabilities include public-web research, desktop/workspace abilities, broader evaluated language competence, relationship/personality learning and full doctrinal coverage. They require separate scope and acceptance decisions after the continuing-runtime gates; they are not part of a prescribed older release order.

## Behavioral repertoire and completeness

The design includes internally initiated reflection/exploration, goal formation from ambition, ordinary conversation, evidence-seeking, correction, continuation, contextual affect, learning proposals and deliberate quiet. New experiences can revise supported memories and candidate interests; they cannot silently grant capabilities. Each added behavior needs a trigger/motive, context, intention, observed outcome, budget and acceptance example. “All human behaviors” is a research direction rather than a finite completed specification; biological experience, unrestricted learning and subjective consciousness are not established by this repertoire.

## What human-like means here

Evaluate continuity, contextual response, remembered commitments, evidence-based correction, bounded initiative and explainable affect influence. Do not use pleasant wording or emotional vocabulary as a substitute for these capabilities. The system is not claimed to have subjective feeling, biological needs, consciousness or attainment. Age/gender/background are configured information, not grounds for stereotypes or invented life experience.

## Completion rule

Every requirement needs implementation evidence and appropriate acceptance scenarios, recorded in [status](../delivery/status.md). Passing a few commands, a catalog count, a successful Codex reply or an attractive diagram does not establish completion. The [model reference](../reference/model.md) owns the separate full doctrinal coverage gate.
