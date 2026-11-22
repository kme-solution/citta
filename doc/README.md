# Citta documentation

**Design baseline accepted:** 2026-11-21. Kyaw approved the original architecture and behavior flowcharts; the 2026-11-22 refinement explicitly adds internally initiated topics/activity, local conversation initiation and improvement proposals. The technology stack (Temporal, local Ollama cognition and the supporting API/UI/storage choices) was also accepted on 2026-11-22. The existing application is a prototype; design approval is not implementation completion.

## Start here and document ownership

| Read      | Document                                                   | Owns                                                                                      |
| --------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1         | [Product requirements](product/requirements.md)            | Intended outcomes, stable requirement IDs and scope                                       |
| 2         | [Approved architecture](design/architecture.md)            | A01-A10 system boundaries and module ownership                                            |
| 3         | [Approved behavior flows](design/behavior-flows.md)        | F01-F26, S01-S60 and W01-W06 behavioral cases                                             |
| 4         | [Runtime contracts](design/contracts.md)                   | Derived invariants, records, state transitions and interface boundaries                   |
| As needed | [Local cognition evaluation](design/model-evaluation.md)   | Laptop constraints, model candidates and paired English/Myanmar measurement protocol      |
| 5         | [Development plan](delivery/plan.md)                       | Dependency gates, implementation order and acceptance mapping                             |
| 6         | [Current status](delivery/status.md)                       | Actual completion, verification, open decisions and next safe task                        |
| As needed | [Local operations](operations/local.md)                    | Commands supported by the current code and local configuration                            |
| As needed | [Catalog reference](reference/catalog.md)                  | Existing catalog/simulator usage and fixture assumptions                                  |
| As needed | [Manasikara module contract](design/modules/manasikara.md) | First deep source-backed module specification, behavior scenarios and unimplemented gates |
| As needed | [Source/model reference](reference/model.md)               | Buddhist sources, interpretation boundaries and doctrinal coverage targets                |

## Authority and conflict handling

Current user instructions and `AGENTS.md` govern work. For product behavior, the approved architecture and flowcharts are the baseline. Requirements summarize that intent; contracts refine it; the plan schedules it. Operations describe existing code, not permission to keep a behavior that contradicts the target.

If documents or code disagree, record the exact conflict in status and resolve the affected specification before implementing that behavior. Do not silently choose whichever version is easiest. A plan change cannot redefine an approved behavior. Architecture/flow changes require a concrete impact explanation and Kyaw's agreement. Source mappings and implementation correctness are reviewed separately.

Use one owner per fact: definitions in contracts, drawing branches/scenarios in behavior flows, source interpretation in model reference, and actual evidence in status. Link to that owner instead of copying a competing specification. Markdown is authoritative; rendered documents are derived views and must be regenerated when their source changes.

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
