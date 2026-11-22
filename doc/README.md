# Citta documentation

**Design baseline accepted:** 2026-11-21. Kyaw approved the original architecture and behavior flowcharts; the 2026-11-22 refinement explicitly adds internally initiated topics/activity, local conversation initiation and improvement proposals. The technology stack (Temporal, local Ollama cognition and the supporting API/UI/storage choices) was also accepted on 2026-11-22. The existing application is a prototype; design approval is not implementation completion.

## Start here and document ownership

| Read      | Document                                                                    | Owns                                                                                      |
| --------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1         | [Product requirements](product/requirements.md)                             | Intended outcomes, stable requirement IDs and scope                                       |
| 2         | [Approved architecture](design/architecture.md)                             | A01-A10 system boundaries and module ownership                                            |
| 3         | [Approved behavior flows](design/behavior-flows.md)                         | F01-F26, S01-S60 and W01-W06 behavioral cases                                             |
| 4         | [Runtime contracts](design/contracts.md)                                    | Derived invariants, records, state transitions and interface boundaries                   |
| As needed | [Local cognition evaluation](design/model-evaluation.md)                    | Laptop constraints, model candidates and paired English/Myanmar measurement protocol      |
| 5         | [Development plan](delivery/plan.md)                                        | Dependency gates, implementation order and acceptance mapping                             |
| 6         | [Current status](delivery/status.md)                                        | Actual completion, verification, open decisions and next safe task                        |
| As needed | [Local operations](operations/local.md)                                     | Commands supported by the current code and local configuration                            |
| As needed | [Catalog reference](reference/catalog.md)                                   | Existing catalog/simulator usage and fixture assumptions                                  |
| As needed | [Manasikara module contract](design/modules/manasikara/02-digital-model.md) | First deep source-backed module specification, behavior scenarios and unimplemented gates |
| As needed | [Source/model reference](reference/model.md)                                | Buddhist sources, interpretation boundaries and doctrinal coverage targets                |

## Authority and conflict handling

Current user instructions and `AGENTS.md` govern work. For product behavior, the approved architecture and flowcharts are the baseline. Requirements summarize that intent; contracts refine it; the plan schedules it. Operations describe existing code, not permission to keep a behavior that contradicts the target.

If documents or code disagree, record the exact conflict in status and resolve the affected specification before implementing that behavior. Do not silently choose whichever version is easiest. A plan change cannot redefine an approved behavior. Architecture/flow changes require a concrete impact explanation and Kyaw's agreement. Source mappings and implementation correctness are reviewed separately.

Use one owner per fact: definitions in contracts, drawing branches/scenarios in behavior flows, source interpretation in model reference, and actual evidence in status. Link to that owner instead of copying a competing specification. Markdown is authoritative; rendered documents are derived views and must be regenerated when their source changes.

## Module documentation: three documents, one module at a time

Each reviewed module has exactly three owning documents under `doc/design/modules/<pali-name>/`, read in order:

1. `01-buddhist-explanation.md`: the teaching, sources and terminology, distinguishing discourses from later explanations. Write this document in Myanmar; retain Pali terms and precise source references.
2. `02-digital-model.md`: our engineering interpretation, behavioral requirements, boundaries and scenarios. Do not attribute engineering choices to the Buddha.
3. `03-implementation.md`: code ownership, data contracts, persistence/integration, implementation slices and acceptance gates. Distinguish existing code from proposed work.

Work through one module before expanding to another. The current module documentation inventory covers every existing `src/modules/` directory and the explicitly missing phassa, sanna and pannatti boundaries. Each module has its three owning documents; these are prepared specifications, not implementation certificates or expert terminology approval.

| Module / scope                                             | 1. Buddhist explanation — Myanmar                                | 2. Digital model                                             | 3. Implementation                                                |
| ---------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| `cetana` — Intention                                       | [မြန်မာ](design/modules/cetana/01-buddhist-explanation.md)        | [Behavior](design/modules/cetana/02-digital-model.md)        | [Code design](design/modules/cetana/03-implementation.md)        |
| `manasikara` — Object orientation                          | [မြန်မာ](design/modules/manasikara/01-buddhist-explanation.md)    | [Behavior](design/modules/manasikara/02-digital-model.md)    | [Code design](design/modules/manasikara/03-implementation.md)    |
| `dvara` — Input admission                                  | [မြန်မာ](design/modules/dvara/01-buddhist-explanation.md)         | [Behavior](design/modules/dvara/02-digital-model.md)         | [Code design](design/modules/dvara/03-implementation.md)         |
| `phassa` — Available encounter — missing implementation    | [မြန်မာ](design/modules/phassa/01-buddhist-explanation.md)        | [Behavior](design/modules/phassa/02-digital-model.md)        | [Code design](design/modules/phassa/03-implementation.md)        |
| `sanna` — Recognition — missing implementation             | [မြန်မာ](design/modules/sanna/01-buddhist-explanation.md)         | [Behavior](design/modules/sanna/02-digital-model.md)         | [Code design](design/modules/sanna/03-implementation.md)         |
| `vedana` — Modeled appraisal                               | [မြန်မာ](design/modules/vedana/01-buddhist-explanation.md)        | [Behavior](design/modules/vedana/02-digital-model.md)        | [Code design](design/modules/vedana/03-implementation.md)        |
| `chanda` — Interests and candidate concerns                | [မြန်မာ](design/modules/chanda/01-buddhist-explanation.md)        | [Behavior](design/modules/chanda/02-digital-model.md)        | [Code design](design/modules/chanda/03-implementation.md)        |
| `sati` — Retention and relevant recollection               | [မြန်မာ](design/modules/sati/01-buddhist-explanation.md)          | [Behavior](design/modules/sati/02-digital-model.md)          | [Code design](design/modules/sati/03-implementation.md)          |
| `paccavekkhana` — Outcome and consequence review           | [မြန်မာ](design/modules/paccavekkhana/01-buddhist-explanation.md) | [Behavior](design/modules/paccavekkhana/02-digital-model.md) | [Code design](design/modules/paccavekkhana/03-implementation.md) |
| `sikkha` — Independent constraints                         | [မြန်မာ](design/modules/sikkha/01-buddhist-explanation.md)        | [Behavior](design/modules/sikkha/02-digital-model.md)        | [Code design](design/modules/sikkha/03-implementation.md)        |
| `kamma` — Typed abilities and effects                      | [မြန်မာ](design/modules/kamma/01-buddhist-explanation.md)         | [Behavior](design/modules/kamma/02-digital-model.md)         | [Code design](design/modules/kamma/03-implementation.md)         |
| `vithi` — Continuing-agent orchestration                   | [မြန်မာ](design/modules/vithi/01-buddhist-explanation.md)         | [Behavior](design/modules/vithi/02-digital-model.md)         | [Code design](design/modules/vithi/03-implementation.md)         |
| `vaca` — Communication                                     | [မြန်မာ](design/modules/vaca/01-buddhist-explanation.md)          | [Behavior](design/modules/vaca/02-digital-model.md)          | [Code design](design/modules/vaca/03-implementation.md)          |
| `nama` — Doctrinal nama / conventional-profile naming debt | [မြန်မာ](design/modules/nama/01-buddhist-explanation.md)          | [Behavior](design/modules/nama/02-digital-model.md)          | [Code design](design/modules/nama/03-implementation.md)          |
| `pannatti` — Designation — missing implementation          | [မြန်မာ](design/modules/pannatti/01-buddhist-explanation.md)      | [Behavior](design/modules/pannatti/02-digital-model.md)      | [Code design](design/modules/pannatti/03-implementation.md)      |
| `khandha` — Aggregate reference projection                 | [မြန်မာ](design/modules/khandha/01-buddhist-explanation.md)       | [Behavior](design/modules/khandha/02-digital-model.md)       | [Code design](design/modules/khandha/03-implementation.md)       |
| `cetasika` — Factor reference and associations             | [မြန်မာ](design/modules/cetasika/01-buddhist-explanation.md)      | [Behavior](design/modules/cetasika/02-digital-model.md)      | [Code design](design/modules/cetasika/03-implementation.md)      |
| `citta-sangaha` — Consciousness-type catalog               | [မြန်မာ](design/modules/citta-sangaha/01-buddhist-explanation.md) | [Behavior](design/modules/citta-sangaha/02-digital-model.md) | [Code design](design/modules/citta-sangaha/03-implementation.md) |
| `citta-vithi` — Reference process simulator                | [မြန်မာ](design/modules/citta-vithi/01-buddhist-explanation.md)   | [Behavior](design/modules/citta-vithi/02-digital-model.md)   | [Code design](design/modules/citta-vithi/03-implementation.md)   |

The shared source ledger owns bibliography and research-layer notes; module documents own their specific explanations and interpretations. Actual completion, executed evidence and the requested [module/service structure review](delivery/status.md#module-and-service-structure-review--read-only) stay in delivery status. The coding designs are proposed corrections, not permission to replace several services at once. Infrastructure such as PostgreSQL and Codex is not assigned a fabricated Buddhist identity or three doctrinal documents.

## Drawn review documents

- [Behavior flows PDF](../artifacts/design/behavior-flows.pdf): 26 diagrams, 60 scenarios and six walkthroughs.
- [Architecture PDF](../artifacts/design/architecture.pdf): ten architecture diagrams and supporting decisions.
- [Flowchart gallery](../artifacts/design/flowcharts.html): indexed visual view of the same behavior diagrams.

Generated design artifacts live in `artifacts/design/`. Editable sources live in `doc/design/`. There is no parallel archive of obsolete plans; Git history retains prior revisions.

## Change and resumption discipline

1. Start with status and the affected requirement, diagram and contract. Read relevant code before changing it.
2. Identify the acceptance scenarios and any unresolved decision that blocks this slice.
3. Make the smallest coherent source change; preserve unrelated work and existing persisted data.
4. Update the owning document if the agreed design detail changes. Keep scenario/diagram IDs stable.
5. Record what actually changed and what was actually verified in status, with limitations and next safe task.

Follow the project convention: Kyaw installs, builds, runs, migrates and tests locally unless he explicitly requests those actions. Do not invent unavailable commands or record planned checks as passed.

## Documentation maintenance commands

Run these read-only documentation checks from the repository root:

```bash
python3 tools/docs/check_docs.py
python3 tools/docs/render_design.py --check
```

The first checks internal links/anchors and stable A/F/S/W identifiers. The second checks source, renderer and artifact hashes against `artifacts/design/manifest.json`, so stale drawings cannot silently appear current. Neither starts the application or reads `.env`.

After an authorized design-source change, regenerate the derived PDFs/gallery with `python3 tools/docs/render_design.py`, then render the PDFs with Poppler and visually inspect the changed pages. The renderer uses installed Graphviz `dot` and Poppler `pdfunite`; it adds no application dependency. It supports the diagram subset used by the approved documents, not arbitrary Mermaid syntax. Record actual review evidence in status. Regeneration does not itself mean design approval or application acceptance.
