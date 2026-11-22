# Manasikara: attending to an object

**Stage:** researched specification and implementation boundary; behavioral acceptance is pending. This is the first deep module review, not certification of the whole application. The earlier operational review and passing infrastructure tests do not establish this contract.

**Owners:** doctrinal provenance belongs to [source/model reference](../../reference/model.md); runtime ownership belongs to [contracts](../contracts.md); progress and executed evidence belong to [status](../../delivery/status.md). This document owns the detailed manasikara behavior and MA requirements. It refines A02/A08, F02/F08/F21 and REQ-03/REQ-14/REQ-15/REQ-18 without assigning literal consciousness to software.

## 1. Research basis and limits

Use source IDs MA-S1 through MA-S10 in the reference ledger. Those entries distinguish translated discourses from later Theravada explanation. No queue length, scheduler tick, database row, language-model invocation or screenshot is itself a Buddhist thought-moment.

MA-S7 explains the technical Theravada use of attention as orientation toward an object, alongside associated factors. MA-S1 concerns appropriate versus inappropriate attention, which is a different question from merely selecting an object. These must not be collapsed into a single numeric priority or a model-generated claim that its attention is wise.

The engineering interpretation below is ours. Practical usefulness, evidence discipline, respecting the operator and avoiding harmful action are application criteria; they are not a substitute for the discourses' liberative aim. A curious thought about astronomy is not automatically inappropriate because it is unrelated to KME. A task-relevant thought is not automatically appropriate merely because it may earn money.

MA-S2 and MA-S3 motivate reviewing the consequences of continued elaboration and changing direction when needed. They do not prescribe a fixed number of model turns. MA-S4 motivates care about self-reinforcing interpretation, but a repeated software string is not a diagnosis of papanca. MA-S5/MA-S6/MA-S8/MA-S9 identify adjacent concepts that need their own deep contracts.

## 2. The current implementation gap

| Existing mechanism                    | What it really supplies                                                               | What it does not establish                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `selectAttention` priority comparator | An engineering choice among ready work, with stable tie-breaking and a fairness quota | The object being attended to, the orientation of consideration, or appropriate attention |
| One Temporal foreground loop          | Serialized domain decisions and effect review                                         | Literal mental succession, associated mental factors or a human stream of consciousness  |
| Persistent focus record               | A retained concern, source, next step and release reason                              | Proof that each generated response stays relevant or that settlement is justified        |
| Evidence IDs and kinds                | Provenance and some independent factual/authority checks                              | Complete perception, mindfulness, understanding or ethical discernment                   |
| A fluent reflection or `focusReview`  | A model proposal, with recorded text                                                  | Actual investigation, wisdom, learning, a verified outcome or spiritual attainment       |
| Activity's old manasikara label       | A presentation of a queue-selection record                                            | A measured invocation of a doctrinal attention mechanism                                 |

The comparator is useful and should move to `vithi`, where queue arbitration belongs. Removing the wrong ownership does not require deleting its tested scheduling guarantees. The new manasikara implementation must add a meaningful object contract and use it in actual consideration; renaming a function or attaching a decorative Pali label is insufficient.

## 3. Three concepts that remain separate

**Work opportunity:** an event the runtime can process now, such as a message, completed effect or internal cue. Queue arbitration decides which opportunity gets a turn. Its quota and tie-break are engineering policy.

**Attended object:** the primary content this consideration addresses. It may be a received message, an observed or reported result, a remembered concern, a selected question, a starting interest or a scheduled concern. This is an application representation of an object, not proof of phenomenal experience.

**Continuing concern:** the longer-lived purpose that can span many objects. Studying KME is a concern. A particular Services-page screenshot, a correction from Kyaw and a question about the screenshot are different objects within or interrupting that concern.

A result of inference is a proposal about the current object; it must not become an independent observed fact merely because a provider returned it. A real file/screen result can become the next attended object while the task and its criterion remain retained. The active object's source kind must survive that transition.

## 4. Requirements derived for Kyaw2

All MA requirements are engineering decisions informed by the research. They are not presented as quotations or literal equivalences.

| ID    | Required behavior                                                    | Observable acceptance                                                                                                                    |
| ----- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| MA-01 | Keep work arbitration outside manasikara                             | Queue policy lives under vithi and its trace says it selected work                                                                       |
| MA-02 | Bind each new considered decision to one explicit primary object     | Snapshot retains object ID, kind, source references, task and policy version                                                             |
| MA-03 | Preserve what is being considered across proposal generation         | Accepted proposal names the selected object; a different object ID is rejected independently                                             |
| MA-04 | Preserve epistemic boundaries                                        | Model proposals/imagined questions remain inferred; adviser speech stays reported; an uncertain effect is not successful observation     |
| MA-05 | Allow more than the current environment to supply an object          | A remembered concern or free question can be selected with an attributable origin and no fabricated experience                           |
| MA-06 | Distinguish interruption from forgetting                             | A greeting can become the current object while the displaced concern and return step remain retained                                     |
| MA-07 | Treat feedback as new content without replacing the original purpose | File/screenshot feedback has its own object reference and the original goal/criterion remain unchanged                                   |
| MA-08 | Permit sustained consideration and intentional redirection           | Next-step and source records explain continuation, settlement, blockage or a detour; no mandatory random topic rotation                  |
| MA-09 | Do not equate recurrence with progress                               | Repeated wording, a new object ID or another model call is not enough to claim a new finding                                             |
| MA-10 | Preserve one individual's continuity across conversations            | Conversation supplies communication context; it cannot independently erase a retained object/concern or invalidate relevant agent memory |
| MA-11 | Make the actual boundaries inspectable                               | Activity distinguishes queue arbitration, object orientation, context retrieval, proposal and observed result                            |
| MA-12 | Preserve historical replay honestly                                  | Read existing queue snapshots with their original policy; do not rewrite past decisions as if they contained the new object mechanism    |
| MA-13 | Do not certify wisdom through a field                                | An object-ID check establishes reference consistency only; semantic suitability needs evidence and consequence review with other modules |
| MA-14 | Preserve user control and truthful failure                           | Pause/Stop, scope, stale versions and unknown-effect guards outrank proposed curiosity or orientation                                    |

## 5. Object representation

The first implementation should use existing decision/action JSON snapshots rather than invent another authoritative store for the same data.

An object-attention record contains:

- A versioned engineering policy identifier.
- The primary object ID, administrative kind and a bounded descriptive excerpt.
- Source reference IDs and their existing configured/reported/observed/inferred status.
- The original task ID, current trigger observation and, when present, focus ID/version.
- The mode of orientation: receive, examine feedback, remember, continue a question, explore a starting interest or revisit a scheduled concern.
- A short derived reason stating why this object is present. It is not a hidden reasoning transcript.
- A feedback status when needed: returned, failed or effect unconfirmed. Receiving a screenshot does not itself establish a successful application action.

Source references must come from the retained input, owned memory or actual effect records. A source missing from selected context cannot be silently invented. A synopsis is explicitly an excerpt. Do not truncate the actual operator request or current criterion to manufacture a fit.

The object should remain stable across an INFER request and its returned proposal. A subsequent file/screen result can change the object; the transition records why. The original concern remains a distinct retained link. `continuationTask`, focus and selected evidence remain needed; the new object record must not replace them with one overloaded text string.

## 6. Cooperation with the other modules

| Boundary                       | Responsibility                                                                                                                   |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| dvara / future phassa contract | Establish actual input/channel and available content; do not turn text labels into literal bodily contact                        |
| manasikara                     | Identify the primary object and orient this consideration toward it                                                              |
| future sanna contract          | Recognition/interpretation requires a separately specified mechanism; administrative object kinds do not implement perception    |
| vedana                         | A modeled feeling/appraisal refers to the same decision/object; a timeout does not become bodily pain                            |
| sati                           | Retrieve relevant valid records and maintain context. Database storage alone is not the mindfulness faculty                      |
| cetana                         | Form the proposed intention concerning this object; distinguish alternatives and actual authority                                |
| chanda                         | Supply candidate concerns/interests and retain a return point; desire does not authorize an action                               |
| sikkha                         | Check permitted scope independently and supply explicit behavioral constraints; authorization is not a complete ethical training |
| kamma                          | Perform an authorized effect and return actual feedback                                                                          |
| paccavekkhana                  | Examine the outcome and consequences, including whether the proposed next step remains justified                                 |
| vithi                          | Serialize work, retain continuations and replay recorded engineering state                                                       |

These are software responsibilities. In the later Theravada account, associated mental factors are not a sequence of independent microservices taking turns as separate minds. The application may record their modeled facets in separate tables without claiming that database insertion order is doctrinal order.

## 7. Lifecycle and correction rules

1. The scheduler admits one ready opportunity under current controls and records its engineering selection.
2. The runtime selects owned, valid context and establishes the primary object. The object can be a received stimulus or internally supplied content.
3. A sufficient local operation can respond without a model. A model request receives the same explicit object and bounded source context.
4. Before application, independently validate object reference, goal/focus versions, source validity, action scope and available abilities. A matching object ID alone is not semantic acceptance.
5. A successful inference remains a proposal. An actual external effect produces a separate feedback record, including uncertainty when confirmation is absent.
6. Review feedback under the retained task. Continue, ask, record a justified stopping point, or deliberately change direction with a return point.
7. A correction rechecks the sources; it is not merely appended to a provider conversation while the invalidated claim stays authoritative.
8. Pause preserves context; Stop and cancellation prevent prohibited continuation. Late results cannot revive a cancelled task or stale focus.

No step creates a fake text thought to make an idle screen appear alive. A future settled-attentive mode must be specified with vithi/chanda and Kyaw's continuous-mind requirement; it must preserve independent initiative without mechanically demanding a new sentence every second. This first object-binding slice must not quietly introduce an arbitrary idle cutoff.

## 8. Detailed scenarios

| ID     | Situation                                             | Required outcome / forbidden shortcut                                                                                          |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| MA-C01 | Kyaw asks a simple identity question                  | Attend to the actual message; answer from configured identity without unnecessary inference or invented memory                 |
| MA-C02 | KME research is interrupted by “hello”                | Address the greeting, retain the research concern and return step; do not declare research complete                            |
| MA-C03 | Kyaw gives a correction while a proposal is pending   | Validate the corrected source before applying the proposal; reconsider against the current object/context                      |
| MA-C04 | A file read returns a sample deployment estimate      | Treat the result as observed sample-file content, not verified KME scope, user approval or an actual project estimate          |
| MA-C05 | A screenshot follows a click                          | Attend to the actual image/feedback and verify what changed; delivered input alone is not task success                         |
| MA-C06 | An effect times out after input may have happened     | Retain the unconfirmed effect and stop blind redispatch; do not manufacture an observed success                                |
| MA-C07 | An adviser claims a buyer has a budget                | Keep it reported/unverified; the buyer's budget is not established by the adviser or its repetition                            |
| MA-C08 | An idle memory suggests a business question           | Make the remembered concern and its source explicit; preserve its reported/inferred distinction                                |
| MA-C09 | No task exists and a scientific question arises       | Allow curiosity without demanding a current-environment link; do not claim an experiment was performed                         |
| MA-C10 | A new association is attractive mid-inquiry           | Either record a useful relationship to the current object or deliberately defer with a return point; silent substitution fails |
| MA-C11 | Several turns paraphrase the same delivery suggestion | Preserve it as one speculative idea; identify an evidence step, change orientation or acknowledge a stopping point             |
| MA-C12 | The model returns another object's ID                 | Reject it even when JSON is valid; no file/computer effect is dispatched from that proposal                                    |
| MA-C13 | A newer conversation is opened                        | Retain the individual concern and relevant memory source; the communication context changes, not the individual                |
| MA-C14 | An old source note is invalidated                     | Do not preserve its object as current fact. Keep audit history and select the valid source/context                             |
| MA-C15 | Work is paused/stopped or its task is cancelled       | Retain the true control result; no claimed autonomous thought or action bypasses the boundary                                  |
| MA-C16 | A prior decision only has the old queue snapshot      | Replay the old policy and label it engineering arbitration; do not invent a new attention record for its history               |
| MA-C17 | A request contains unpleasant criticism               | Keep the actual message and evidence in view; unpleasant modeled tone does not justify hostility or suppressing correction     |
| MA-C18 | The program wants an upgrade or more privileges       | Regard the wish as a candidate concern; no root access, policy rewrite or execution right follows from it                      |

For each semantic scenario, evaluate distinct paraphrases and contexts, inspect source/correction lineage, and review the actual next action/outcome. A golden sentence or successful JSON parse is not the acceptance oracle.

## 9. Implementation slices and honest completion

**MA-A, structural foundation:** move queue arbitration to vithi; add a real object-attention record to new considered decisions and model context; independently bind proposals to that object; correct Activity's module attribution; retain old snapshot replay. This can be implemented without an extra SQL table.

**MA-B, behavioral continuity:** prove interruption/return, feedback-object transitions, correction handling, free thought and explicit detours through the actual runtime. Requires authorized tests and provider/browser observation; fixtures alone are insufficient.

**MA-C, appropriate orientation:** research and implement consequence-oriented consideration in cooperation with cetana/sikkha/paccavekkhana, including unhelpful elaboration and justified redirection. Do not add a fake `wise=true` field or treat goal relevance as wholesomeness. This gate is not satisfied by MA-A.

**MA-D, cross-module fidelity:** complete the phassa/sanna/vedana/sati/chanda/identity contracts and revisit the shared object/facet boundaries. Missing modules and naming debt must remain explicit until their mechanisms and acceptance scenarios exist.

The whole manasikara module remains PARTIAL until the relevant behavioral and cross-module gates have evidence. Source completion, a scheduler's fairness test and a Pali filename cannot substitute for that evidence.
