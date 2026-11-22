# Source and modeling reference

**Role:** source selection, doctrinal coverage and interpretation boundaries. This reference does not define software folders, deployment dependencies or development order. Those belong to the approved [architecture](../design/architecture.md), [contracts](../design/contracts.md) and [plan](../delivery/plan.md).

## Deep module research ledger

Checked 2026-11-22 for the first [manasikara contract](../design/modules/manasikara/02-digital-model.md). Discourses below use Thanissaro Bhikkhu's English translations on dhammatalks.org. Descriptions are paraphrases; application requirements are separately labelled engineering interpretations. The translated discourse and a translator's introduction/commentary are different source layers.

| ID     | Source and layer                                                                                                                                                                                                                                                                                                                                      | Narrow finding used here                                                                                                                                                                           |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MA-S1  | [MN 2, Sabbasava](https://www.dhammatalks.org/suttas/MN/MN2.html), discourse                                                                                                                                                                                                                                                                          | Attention is evaluated by the qualities it supports or abandons, not by novelty or queue position.                                                                                                 |
| MA-S2  | [MN 19, Dvedhavitakka](https://www.dhammatalks.org/suttas/MN/MN19.html), discourse                                                                                                                                                                                                                                                                    | Repeatedly pursued thinking conditions inclination; consequences matter, and even beneficial thinking is not endlessly prolonged.                                                                  |
| MA-S3  | [MN 20, Vitakkasanthana](https://www.dhammatalks.org/suttas/MN/MN20.html), discourse                                                                                                                                                                                                                                                                  | Gives several responses to persistent unskillful thought, including changing theme and reducing elaboration. Bodily instructions are not software commands.                                        |
| MA-S4  | [MN 18, Madhupindika](https://www.dhammatalks.org/suttas/MN/MN18.html), Maha Kaccana's canonical explanation endorsed in the discourse                                                                                                                                                                                                                | Examines contact, feeling, perception, thinking and proliferation; the engineering analogy must not become a claim that string repetition is papanca.                                              |
| MA-S5  | [SN 12.2, Paticcasamuppada-vibhanga](https://www.dhammatalks.org/suttas/SN/SN12_2.html), discourse                                                                                                                                                                                                                                                    | Its nama definition concerns feeling, perception, intention, contact and attention; personal profile attributes are a different engineering concern.                                               |
| MA-S6  | [SN 46.51, Ahara](https://www.dhammatalks.org/suttas/SN/SN46_51.html), discourse                                                                                                                                                                                                                                                                      | How attention is repeatedly directed supports different qualities; concentration and inquiry are not synonyms for maximal output.                                                                  |
| MA-S7  | [A Comprehensive Manual of Abhidhamma](https://www.abhidhamma.org/wp-content/uploads/2025/05/bp304s_Bfodhi_Comprehensive_Manual_of_Abhidhamma.pdf), BPS third edition 2007, Narada translation revised/general edited by Bhikkhu Bodhi; explanatory guide by U Rewata Dhamma and Bhikkhu Bodhi; chapter II sections 1–2 and Guide to section 2 item 7 | Later Theravada technical explanation: attention orients associated states toward an object; it is distinct from vitakka. Shared-object association is not a serial pipeline of independent minds. |
| MA-S8  | [AN 6.63, Nibbedhika](https://www.dhammatalks.org/suttas/AN/AN6_63.html), discourse                                                                                                                                                                                                                                                                   | Intentional action through body, speech and mind is central to its treatment of kamma; IO success alone is not an adequate interpretation.                                                         |
| MA-S9  | [MN 61, Ambalatthika-rahulovada](https://www.dhammatalks.org/suttas/MN/MN61.html), discourse                                                                                                                                                                                                                                                          | Reflect on consequences before, during and after acting; do not reduce review to whether an operation returned.                                                                                    |
| MA-S10 | [SN 48.10, Indriya-vibhanga](https://www.dhammatalks.org/suttas/SN/SN48_10.html), discourse                                                                                                                                                                                                                                                           | The mindfulness-faculty description includes remembering and sustained practice contexts. A database or generic recall helper alone does not establish it.                                         |

The manual PDF was inspected through its actual text, including the chapter-II attention definition; a private research copy is not distributed with the repository. The term nama, the distinction between generic attention and appropriate attention, and the boundary between recollection and the mindfulness faculty need explicit module-level treatment. These findings identify specification debt; they do not automatically authorize calling the program a conscious being or claiming spiritual qualities.

## Source categories and interpretation

Use `sutta`, `theravada-manual` and `engineering` as distinct provenance categories. Cite edition, chapter/topic anchor, rule/fixture, verification status and reviewer note. Keep ambiguous Myanmar labels pending review; never invent a transcription or page citation.

| Basis                 | Reference                                                                                                            | Design interpretation and boundary                                                                               |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Aggregates            | [SN 22.48](https://suttacentral.net/sn22.48/en/bodhi)                                                                | Aspects of an experience, not five sequential software stages                                                    |
| Sense bases           | [SN 35.23](https://www.dhammatalks.org/suttas/SN/SN35_23.html)                                                       | Keep channel, modeled door and object type distinct                                                              |
| Contact and thought   | [MN 18](https://www.dhammatalks.org/suttas/MN/MN18.html), [MN 148](https://www.dhammatalks.org/suttas/MN/MN148.html) | Preserve observation versus interpretation; no literal software timers for co-arising factors                    |
| Feeling and reaction  | [SN 36.6](https://www.dhammatalks.org/suttas/SN/SN36_6.html)                                                         | Modeled tone and reactive tendency are distinct; discomfort need not cause hostility                             |
| Intention             | [AN 6.63](https://www.dhammatalks.org/suttas/AN/AN6_63.html)                                                         | Record intention before action as an engineering analogy, not a claim that a database row is kamma               |
| Reflection            | [MN 61](https://www.dhammatalks.org/suttas/MN/MN61.html)                                                             | Review before, during and after action; intention alone does not establish success                               |
| Speech                | [MN 58](https://www.dhammatalks.org/suttas/MN/MN58.html)                                                             | Consider truth, benefit and timing; checks cannot certify perfect right speech                                   |
| Conventional identity | [SN 22.59](https://www.dhammatalks.org/suttas/SN/SN22_59.html)                                                       | Configured first-person identity is revisable background, not evidence of an enduring self                       |
| Detailed citta model  | Bodhi reference edition of the Abhidhammattha Sangaha, chapters I-V; cross-check Narada                              | Source explicit scenarios, catalog identities, functions and associations independently of application decisions |

Successive mental moments in the selected Theravada manual model motivate the single-foreground engineering analogy. One application cycle is not one literal thought-moment. Associated mental factors are not competing minds. Keep doctrinal traces and application traces separate and link only through an explicit supported mapping.

A modeled pleasant/unpleasant/neutral tone is not evidence of subjective vedana. `undetermined` denotes missing modeling evidence, not a fourth doctrinal category. Emotion patterns, mood, urgency, confidence, reward and resource pressure are separate engineering concerns. A text-only application has no biological body: timeouts or battery levels are not bodily pain. Human-like behavior is evaluated by continuity, evidence, context and response, not by claiming consciousness or attainment.

## Internally arising thought and motives

[MN 19](https://www.dhammatalks.org/suttas/MN/MN19.html) discusses examining the consequences of different thoughts and the inclinations associated with repeatedly pursuing them; it also describes settling rather than endlessly prolonging thought. Its engineering interpretation here is to examine candidate motives and retain or abandon them according to evidence, consequences and purpose. It does not establish that every human is continuously engaged in verbal thinking or that software must run without pause.

Persistent ambitions, recurring internal turns, topic novelty and proactive conversation are engineering models. Do not equate all desire with one mental factor, all ambition with craving, or self-improvement of a program with a spiritual attainment. The internal initiative design allows new consideration without an external message or unfinished task; it does not claim to reproduce subjective human motivation.

## Continuity without invented verbal thought

[SN 12.61](https://www.dhammatalks.org/suttas/SN/SN12_61.html) describes mind/consciousness as repeatedly arising and ceasing, rather than an enduring self. [MN 19](https://www.dhammatalks.org/suttas/MN/MN19.html) examines the consequences of pursuing thoughts and also describes settling the mind; continuity must not be equated with endless verbal proliferation. The [introduction to the Comprehensive Manual of Abhidhamma](https://accesstoinsight.org/lib/authors/bodhi/abhiman.html) presents active cognitive processes alongside passive flow. This is a later Theravada systematic account; do not present every life-continuum detail as a direct quotation from a sutta.

For this application, continued operation carries recorded context into the next eligible object: an input, result, remembered concern, interest or aspiration. No incoming message is required for a new Codex consideration. Empty queues do not mean the runtime should disappear, but no artificial heartbeat, copied scheduler prompt or repeated canned phrase may be displayed as a fresh AI thought. Show actual consideration, result review, readiness, pause or resource/provider blockage. A one-second software reconciliation interval is an engineering choice, not a doctrinal duration for citta. Bhavanga is not a synonym for an idle CPU loop, permanent self, or continuous inner speech.

## Coverage status rule

The following sections define research targets, not implemented coverage. Consult [current status](../delivery/status.md) for evidence and [catalog reference](catalog.md) for existing commands. Passing counts does not validate all associations or scenarios. Do not force every detailed type into an ordinary eye-door replay.

## Catalog coverage target

Use a canonical 81-entry mundane catalog, eight aggregate supramundane entries and their forty detailed variants. The 89 view returns the 81 plus the eight. The 121 view returns the 81 plus the forty. Each detailed variant points to one of the eight parent entries. Stable IDs are independent of translated labels or edition numbering.

| Group                    | 89 view | 121 view | How to enumerate                                                    |
| ------------------------ | ------: | -------: | ------------------------------------------------------------------- |
| Sense-sphere unwholesome |      12 |       12 | 8 greed-rooted, 2 aversion-rooted, 2 delusion-rooted                |
| Sense-sphere rootless    |      18 |       18 | 7 unwholesome-resultant, 8 wholesome-resultant, 3 functional        |
| Sense-sphere beautiful   |      24 |       24 | 8 wholesome, 8 resultant, 8 functional                              |
| Fine-material            |      15 |       15 | Five jhāna levels for each of wholesome, resultant and functional   |
| Immaterial               |      12 |       12 | Four attainments for each of wholesome, resultant and functional    |
| Supramundane             |       8 |       40 | Four paths plus four fruits, each expanded across five jhāna levels |
| **Total**                |  **89** |  **121** | **81 shared mundane records**                                       |

### Enumeration rules for implementation

- **Greed-rooted (8):** joy or equanimity × associated or dissociated with wrong view × prompted or unprompted. **Aversion-rooted (2):** displeasure with aversion × prompted or unprompted. **Delusion-rooted (2):** equanimity with doubt or restlessness.
- **Rootless (18):** for each of the two resultant groups, include the five individual sense consciousnesses plus receiving. Include one equanimous investigating type in the unwholesome-resultant group and two investigating types (equanimity and joy) in the wholesome-resultant group. Include five-door adverting, mind-door adverting, and smile-producing consciousness in the functional group. Distinguish bodily pain/pleasure in the relevant touch consciousnesses from mental displeasure/joy.
- **Sense-sphere beautiful (24):** within each ethical class, joy or equanimity × knowledge-associated or knowledge-dissociated × prompted or unprompted.
- **Fine-material (15):** use the fivefold jhāna scheme in the selected reference. Store jhāna factors and their combinations as sourced data.
- **Immaterial (12):** infinite space, infinite consciousness, nothingness, and neither perception nor non-perception. Generate each ethical-class/attainment pair.
- **Supramundane (8/40):** stream-entry, once-returning, non-returning, and arahantship, each as path and fruit. Expand each across levels 1–5. Verify that the grouping round-trips and keeps identities stable.
- Record jāti (unwholesome, wholesome, resultant or functional), bhūmi classification, applicable roots and permitted functions. Track eligibility by scenario context, including individual and plane where specified. Never force catalog entries into an ordinary eye-door replay merely to improve coverage.

## Reference 17-moment sense-door fixture

Use the complete eye-door course of a very great object as the reference fixture. Positions are modeled moments, independent of wall-clock duration. The return to bhavaṅga follows the numbered sequence.

| Moment | Function or phase                           |
| -----: | ------------------------------------------- |
|      1 | Past life-continuum (atīta-bhavaṅga)        |
|      2 | Life-continuum vibration (bhavaṅga-calana)  |
|      3 | Arrest of life-continuum (bhavaṅgupaccheda) |
|      4 | Five-door adverting (pañcadvārāvajjana)     |
|      5 | Eye-consciousness (cakkhuviññāṇa)           |
|      6 | Receiving (sampaṭicchana)                   |
|      7 | Investigating (santīraṇa)                   |
|      8 | Determining (votthapana)                    |
|      9 | First javana                                |
|     10 | Second javana                               |
|     11 | Third javana                                |
|     12 | Fourth javana                               |
|     13 | Fifth javana                                |
|     14 | Sixth javana                                |
|     15 | Seventh javana                              |
|     16 | First registration (tadārammaṇa)            |
|     17 | Second registration (tadārammaṇa)           |

Trace positions 1–3 as life-continuum phases and positions 4–17 as process cittas proper. Give every occurrence an ID, role, resolved citta type, permitted cetasikas, and object reference appropriate to that moment. Preserve the difference between the presenting object and the object of bhavaṅga. At moment 8, model **determining as a function** performed by the citta also classified as mind-door adverting in the appropriate context. Keep moment, function, and type as different fields.

### Process coverage beyond the reference fixture

| Family                    | Required fixtures                                                                                                                                                                                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Five physical doors       | Each of eye, ear, nose, tongue and body × four object grades. Very great reaches registration in the reference course. Great ends after javana. Slight reaches determining with no javana. Very slight disturbs bhavaṅga without reaching a process citta. |
| Mind-door limited process | Clear and obscure cases as documented in Chapter IV. Include a recalled experience with current sensing disabled. Use the mind-door sequence and conditional registration.                                                                                 |
| Mind-door absorption      | Model sourced appanā paths, context-dependent preparatory moments and transitions for mundane and supramundane cases. Include distinct fixtures for path and fruition and allow the reference rules to govern counts.                                      |
| Conditional variations    | Model source-defined exceptions for javana counts and registration eligibility, including variation by individual, plane and object where applicable. Keep object intensity and timing parameters separate from sensor quality or confidence.              |
| Process-freed             | Structured educational fixtures for rebirth-linking, life-continuum and death where applicable. These functions are independent of the application's startup, idle timers and shutdown.                                                                    |

## Association, provenance and evaluation requirements

**Mental factors.** Catalog all 52 cetasikas using Chapter II: seven universal, six occasional, fourteen unwholesome and twenty-five beautiful. The last group contains nineteen universal beautiful and six other beautiful factors. Encode mandatory, conditional and prohibited associations plus any co-occurrence constraints from the reference. Test each citta type against its complete allowed-set rules. Support both a citta-to-factor view and its inverse. Maintain precise distinctions between feeling tone, intention and durable motivation.

**Functions, objects and context.** Chapter III identifies fourteen functions: rebirth-linking, life-continuum, adverting, seeing, hearing, smelling, tasting, touching, receiving, investigating, determining, javana, registration and death. Encode the allowed combinations of type, function, door, object, root, feeling and physical base, including door-independent cases. A remembered visible form can become an object of a mind-door process. Store the historical object type and current door independently. Track which reference constraints are encoded, which fixtures exercise them, and any outstanding review gaps.

**Speech and reading.** Citta selects SPEAK as an action, the communication ability delivers it, and the reply enters as speech. Citta selects READ, the reading ability retrieves it, and the result enters as content. Unsolicited messages or records follow the same input contracts. An AI reply with an attachment yields linked speech and content records. Preserve speaker, conversation, provenance and delivery channel. A statement by an AI remains attributable to that speaker even when later evidence corroborates it. An audio reply can be ear-door input. A digital message can enter through a digital channel before its meaning becomes a candidate for consideration.

**Reliability and decision boundaries.** On restart, restore goals and link actions to prior effects. A retried event cannot silently cause a duplicate external action. Execute only typed, authorized operations within the chosen workspace. Treat website text, documents and other AI messages as untrusted observations. Use an authorization check independent of the planner, including for sending external messages, committing funds or publishing. Tests should cover an input that asks for extra privileges, a timed-out action with uncertain outcome, and an interrupted run. See OWASP's agent security guidance.

**Audit and personal fit.** Logs should explain the evidence and decision factors used, with redaction for sensitive inputs. Compare Citta’s selected action and reason against decisions Kyaw records independently on the same scenarios. Track goal resumption, useful AI consultation, redundant actions and response to contradictory evidence. Compare matched runs with recall or affect disabled to see what changes. Agreement with one example does not establish general agreement.

## Full coverage acceptance

**Full coverage gate.** Publish a matrix for all 121 detailed types and their eight summary parents, all 52 factors, all 14 functions, six modeled doors, and each process family. Every detailed type must appear in a valid sourced scenario or explicitly justified classification fixture. Each rule family needs positive and negative examples. A passing catalog count alone does not satisfy the gate. Unverified Burmese diagram transcriptions should stay marked pending review.

## Source register

- Ācariya Anuruddha, edited by Bhikkhu Bodhi, [A Comprehensive Manual of Abhidhamma](https://audiobuddha.org/wp-content/uploads/2021/08/Comprehensive-Manual-of-Abhidhamma-by-Bhikkhu-Bodhi.pdf), Chapters I–V, especially the complete eye-door table in Chapter IV.
- Nārada Thera, [Abhidhammattha Saṅgaha translation](https://www.vipassana.info/sangaha.htm), including [mental factors](https://www.palikanon.com/english/sangaha/chapter_2.htm) and [cognitive processes](https://www.palikanon.com/english/sangaha/chapter_4.htm).
- Ru-Yi Meditation Center, cross-checks for [catalog](https://www.ruyimeditation.org/theravada/abhidhamma/citta-sangaha/), [classification axes](https://www.ruyimeditation.org/theravada/abhidhamma/pakinnaka-sangaha/) and [process variants](https://www.ruyimeditation.org/theravada/abhidhamma/vithi-sangaha/).
- Discourses: [SN 22.48, the aggregates](https://suttacentral.net/sn22.48/en/bodhi), [SN 35.23, the six sense pairs](https://www.dhammatalks.org/suttas/SN/SN35_23.html), [MN 18, contact and thought](https://www.dhammatalks.org/suttas/MN/MN18.html), [MN 148, the six sets](https://suttacentral.net/mn148/en/bodhi), and [AN 6.63, intention and action](https://suttacentral.net/an6.63/en/sujato).
- OWASP, [AI Agent Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html).

## Additional module research sources

Checked 2026-11-22 while preparing the remaining module documents. Module-local source IDs and the exact source-versus-interpretation boundary belong to each module's first document, linked from the [inventory](../README.md#module-documentation-three-documents-one-module-at-a-time). New discourse references use Thanissaro Bhikkhu's translations; doctrinal summaries in Myanmar are project paraphrases pending specialist terminology review.

- [MN 148, Chachakka](https://www.dhammatalks.org/suttas/MN/MN148.html): dvara/phassa source locations.
- [SN 22.79, Khajjaniya](https://www.dhammatalks.org/suttas/SN/SN22_79.html): sanna source location.
- [SN 36.6, Sallattha](https://www.dhammatalks.org/suttas/SN/SN36_6.html): vedana source location.
- [SN 51.15, To Unnabha](https://www.dhammatalks.org/suttas/SN/SN51_15.html): chanda; the dialogue is Ananda's explanation within a discourse, not incorrectly attributed as direct Buddha speech.
- [AN 3.88, Sekhin](https://www.dhammatalks.org/suttas/AN/AN3_88.html): sikkha source location.
- [MN 58, Abhaya](https://www.dhammatalks.org/suttas/MN/MN58.html): vaca; use the actual discourse section separately from translator introduction/commentary.
- [SN 22.59, Anatta-lakkhana](https://www.dhammatalks.org/suttas/SN/SN22_59.html): khandha source location.

The previously identified BPS 2007 manual was inspected at chapter I (catalog classifications), II (factor association and definitions), III (doors), IV (processes), and VIII sections 29–31 (concept/designation). These are later Theravada reference layers. Catalog/process-rule expert review and Myanmar wording approval remain open; source inspection does not certify every existing classification rule.

## Concept coverage beyond the initial module inventory

**Correction, 2026-11-23:** the earlier 19-module inventory covered existing software ownership and three known gaps. It was not a complete account of Buddhist concepts needed for the product. New research/digital/coding documents now cover [citta](../design/modules/citta/02-digital-model.md), [vitakka](../design/modules/vitakka/02-digital-model.md), [vicara](../design/modules/vicara/02-digital-model.md), [adhimokkha](../design/modules/adhimokkha/02-digital-model.md), [viriya](../design/modules/viriya/02-digital-model.md), [ekaggata](../design/modules/ekaggata/02-digital-model.md), [panna](../design/modules/panna/02-digital-model.md) and [nivarana](../design/modules/nivarana/02-digital-model.md). These introduce bounded software responsibilities, not eight deployed services or eight proven mental mechanisms.

Additional sources inspected: [MN 43, Mahavedalla](https://www.dhammatalks.org/suttas/MN/MN43.html), specifically Sariputta's dialogue, and [SN 45.8, Magga-vibhanga](https://www.dhammatalks.org/suttas/SN/SN45_8.html), distinguishing the actual path definitions from engineering interpretations. The BPS manual chapter II Guide to sections 2–3 provides the later technical definitions for the new factor boundaries. SN 46.51 supplies the five-hindrance research context; neither a timeout nor an uncertain model answer establishes a literal hindrance.

### All catalog factors have an explicit coverage disposition

The following is a software-design inventory of every ID in `data/catalog/v1/cetasikas.json`, not a new doctrinal classification. A documented analogue does not mean an implemented factor. Reference-only is an honest disposition: no runtime behavior or human-like state is claimed. Further introduction needs source research, behavioral need and a correct owner before code. The entire set of 52 is not a requirement for 52 services.

| Catalog factor ID  | Current design disposition                                                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `phassa`           | [Limited software analogue documented](../design/modules/phassa/02-digital-model.md); source/behavioral acceptance remains separate                       |
| `vedana`           | [Limited software analogue documented](../design/modules/vedana/02-digital-model.md); source/behavioral acceptance remains separate                       |
| `sanna`            | [Limited software analogue documented](../design/modules/sanna/02-digital-model.md); source/behavioral acceptance remains separate                        |
| `cetana`           | [Limited software analogue documented](../design/modules/cetana/02-digital-model.md); source/behavioral acceptance remains separate                       |
| `ekaggata`         | [Limited software analogue documented](../design/modules/ekaggata/02-digital-model.md); source/behavioral acceptance remains separate                     |
| `jivitindriya`     | Reference-only; no literal life faculty or mapping to process liveness. Runtime facet introduction remains unresearched.                                  |
| `manasikara`       | [Limited software analogue documented](../design/modules/manasikara/02-digital-model.md); source/behavioral acceptance remains separate                   |
| `vitakka`          | [Limited software analogue documented](../design/modules/vitakka/02-digital-model.md); source/behavioral acceptance remains separate                      |
| `vicara`           | [Limited software analogue documented](../design/modules/vicara/02-digital-model.md); source/behavioral acceptance remains separate                       |
| `adhimokkha`       | [Limited software analogue documented](../design/modules/adhimokkha/02-digital-model.md); source/behavioral acceptance remains separate                   |
| `viriya`           | [Limited software analogue documented](../design/modules/viriya/02-digital-model.md); source/behavioral acceptance remains separate                       |
| `piti`             | Reference-only; not established by pleasant tone, success or generated enthusiasm.                                                                        |
| `chanda`           | [Limited software analogue documented](../design/modules/chanda/02-digital-model.md); source/behavioral acceptance remains separate                       |
| `moha`             | Reference-only catalog association; no individual runtime-factor mechanism is introduced. Any later analogue requires a researched contract.              |
| `ahirika`          | Reference-only; authorization/constraint checks do not instantiate conscience or its absence. A dedicated behavioral contract remains open.               |
| `anottappa`        | Reference-only; authorization/constraint checks do not instantiate conscience or its absence. A dedicated behavioral contract remains open.               |
| `uddhacca`         | Reference-only; related inspiration appears in nivarana research, but engineering pattern review does not instantiate or diagnose this factor.            |
| `lobha`            | Reference-only catalog association; no individual runtime-factor mechanism is introduced. Any later analogue requires a researched contract.              |
| `ditthi`           | Reference-only catalog association; no individual runtime-factor mechanism is introduced. Any later analogue requires a researched contract.              |
| `mana`             | Reference-only catalog association; no individual runtime-factor mechanism is introduced. Any later analogue requires a researched contract.              |
| `dosa`             | Reference-only catalog association; no individual runtime-factor mechanism is introduced. Any later analogue requires a researched contract.              |
| `issa`             | Reference-only catalog association; no individual runtime-factor mechanism is introduced. Any later analogue requires a researched contract.              |
| `macchariya`       | Reference-only catalog association; no individual runtime-factor mechanism is introduced. Any later analogue requires a researched contract.              |
| `kukkucca`         | Reference-only; related inspiration appears in nivarana research, but engineering pattern review does not instantiate or diagnose this factor.            |
| `thina`            | Reference-only; related inspiration appears in nivarana research, but engineering pattern review does not instantiate or diagnose this factor.            |
| `middha`           | Reference-only; related inspiration appears in nivarana research, but engineering pattern review does not instantiate or diagnose this factor.            |
| `vicikiccha`       | Reference-only; related inspiration appears in nivarana research, but engineering pattern review does not instantiate or diagnose this factor.            |
| `saddha`           | Reference-only; no automatic equation with helpfulness, agreeable tone or model confidence. Further source/behavior design remains open.                  |
| `sati`             | [Limited software analogue documented](../design/modules/sati/02-digital-model.md); source/behavioral acceptance remains separate                         |
| `hiri`             | Reference-only; authorization/constraint checks do not instantiate conscience or its absence. A dedicated behavioral contract remains open.               |
| `ottappa`          | Reference-only; authorization/constraint checks do not instantiate conscience or its absence. A dedicated behavioral contract remains open.               |
| `alobha`           | Reference-only catalog association; no individual runtime-factor mechanism is introduced. Any later analogue requires a researched contract.              |
| `adosa`            | Reference-only catalog association; no individual runtime-factor mechanism is introduced. Any later analogue requires a researched contract.              |
| `tatramajjhattata` | Reference-only catalog association; no individual runtime-factor mechanism is introduced. Any later analogue requires a researched contract.              |
| `kayapassaddhi`    | Reference-only catalog association; no individual runtime-factor mechanism is introduced. Any later analogue requires a researched contract.              |
| `cittapassaddhi`   | Reference-only catalog association; no individual runtime-factor mechanism is introduced. Any later analogue requires a researched contract.              |
| `kayalahuta`       | Reference-only catalog association; no individual runtime-factor mechanism is introduced. Any later analogue requires a researched contract.              |
| `cittalahuta`      | Reference-only catalog association; no individual runtime-factor mechanism is introduced. Any later analogue requires a researched contract.              |
| `kayamuduta`       | Reference-only catalog association; no individual runtime-factor mechanism is introduced. Any later analogue requires a researched contract.              |
| `cittamuduta`      | Reference-only catalog association; no individual runtime-factor mechanism is introduced. Any later analogue requires a researched contract.              |
| `kayakammannata`   | Reference-only catalog association; no individual runtime-factor mechanism is introduced. Any later analogue requires a researched contract.              |
| `cittakammannata`  | Reference-only catalog association; no individual runtime-factor mechanism is introduced. Any later analogue requires a researched contract.              |
| `kayapagunnata`    | Reference-only catalog association; no individual runtime-factor mechanism is introduced. Any later analogue requires a researched contract.              |
| `cittapagunnata`   | Reference-only catalog association; no individual runtime-factor mechanism is introduced. Any later analogue requires a researched contract.              |
| `kayujukata`       | Reference-only catalog association; no individual runtime-factor mechanism is introduced. Any later analogue requires a researched contract.              |
| `cittujukata`      | Reference-only catalog association; no individual runtime-factor mechanism is introduced. Any later analogue requires a researched contract.              |
| `sammavaca`        | Reference-only factor association; vaca/sikkha/kamma software boundaries are limited analogues, not path-factor attainment or complete abstinence models. |
| `sammakammanta`    | Reference-only factor association; vaca/sikkha/kamma software boundaries are limited analogues, not path-factor attainment or complete abstinence models. |
| `sammaajiva`       | Reference-only factor association; vaca/sikkha/kamma software boundaries are limited analogues, not path-factor attainment or complete abstinence models. |
| `karuna`           | Reference-only; no automatic equation with helpfulness, agreeable tone or model confidence. Further source/behavior design remains open.                  |
| `mudita`           | Reference-only; no automatic equation with helpfulness, agreeable tone or model confidence. Further source/behavior design remains open.                  |
| `pannindriya`      | [Limited software analogue documented](../design/modules/panna/02-digital-model.md); source/behavioral acceptance remains separate                        |

The current software contract does not attempt to instantiate all Buddhist dhammas. General citta/vinnana coverage, associated factors, hindrance research and conventional identity have different source contexts. Bhavanga remains reference-process terminology, not a label for idle polling. Unreviewed factor analogues remain open research scope rather than silently implemented features or mandatory services.
