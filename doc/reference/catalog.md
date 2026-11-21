# Current catalog and simulator reference

**Role:** usage and interpretation of the existing reference commands. These commands do not prove completion of the approved agent runtime or the [full doctrinal coverage target](model.md). Versioned provenance and Myanmar terminology review remain acceptance work.

## Citta lists

`npm run catalog` shows group totals. Use `npm run catalog -- 89` or `npm run catalog -- 121` for individual identities. The projections share 81 mundane entries; eight summary supramundane identities have forty detailed variants. Stable IDs do not depend on translated labels. Expanded variants retain a summary parent ID.

The `labelMy` column contains draft Myanmar descriptions and `myanmarReview: pending`. English labels remain available for comparison. The same status applies to the mental-factor and function descriptions; this is not a verified transcription of Burmese diagrams.

## Mental factors and functions

Use `npm run catalog -- cetasika` to list the mental factors by stable ID, Pāli name, English meaning and family. Seven universals accompany each citta. The six occasionals, fourteen unwholesome and twenty-five beautiful factors have additional eligibility rules. Listing a factor does not assign it to an occurrence.

Use `npm run catalog -- kicca` to list fourteen functions and see which belong to a cognitive process. The eye-door replay will show the function ID beside the phase, including the three life-continuum positions and both registration moments. Several successive moments can have the same function.

## Factor associations

Use `npm run catalog -- factors TYPE_ID` to inspect required, occasional and excluded factors for an individual detailed type. An eightfold summary path or fruit returns five jhāna-specific alternatives. Optional factors are subject to the restrictions shown alongside each set.

The eye replay uses a sample ordinary desirable visible object, equanimous knowledge-associated unprompted wholesome javana, and equanimous registration. The selected life-continuum type is an assumption of this scenario. Moment records expose their catalog identities and mandatory factors. Optional factors remain unselected.

## Aggregates in the eye-door fixture

Run `npm run eye` to inspect the five aggregates in the 17-moment scenario. Each row represents one moment. The aggregate columns describe that same moment from different aspects.

| Code | Pāli | Meaning in the replay |
|---|---|---|
| rupa | Rūpa | Material context. The presenting visible form becomes the object from five-door adverting onward. The first three life-continuum moments retain their prior object. |
| vedana | Vedanā | Feeling accompanying consciousness. Seeing itself has neutral feeling. Other rows indicate presence wherever the fixture leaves the tone unspecified. |
| sanna | Saññā | Perception marking features of the object. Naming a flower is a later conceptual activity. |
| sankhara | Saṅkhāra | Associated mental factors other than feeling and perception. Volition is one example. |
| vinnana | Viññāṇa | The citta cognizing an object at that moment. The phase column identifies its role. |

The four mental aggregates arise together in the modeled conscious moment. Material form has its own role in the sensory scenario. The replay counts seventeen moments once. This view is computed from the reference fixture and needs no database migration.

## Selecting a cognitive course

Use `npm run eye -- ear great` to inspect a hearing course. The same entry point accepts eye, ear, nose, tongue or body and the grades very-great, great, slight and very-slight. Use `npm run eye -- mind clear` or `npm run eye -- mind obscure` for an ordinary mind-door example. With no arguments the command prints the detailed 17-moment eye fixture.

These additional views show the ordered functions beginning with the disturbance of bhavaṅga. Grade controls the endpoint. Repeated determining or vibration is represented by one illustrative choice of count. The numbered positions in these shorter views are relative to the displayed disturbance. See chapter IV of the reference manual in the [source register](model.md#source-register).

Source selection and full validation requirements are maintained in [model reference](model.md); command execution follows [local operations](../operations/local.md).
