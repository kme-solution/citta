# Cetana: intention and coordinated commitment

Status: requirements derived; behavioral implementation incomplete. This document owns the replacement boundary, not a claim that the runtime models consciousness.

## Sources and interpretation

[AN 6.63](https://www.dhammatalks.org/suttas/AN/AN6_63.html) connects intention with action through body, speech and mind. It does not define intention as parsing commands or approving JSON. [MN 61](https://www.dhammatalks.org/suttas/MN/MN61.html) teaches reflection on consequences before, during and after action; consequence review involves several cooperating application modules, not cetana alone. [MN 19](https://www.dhammatalks.org/suttas/MN/MN19.html) describes how repeated thinking conditions inclination. These discourse teachings inform requirements; they do not prescribe software classes, reward functions or numerical morality scores.

The later Theravada manual already identified in the [research ledger](../../reference/model.md) treats cetana as an associated coordinating factor. A long-lived application goal is an engineering commitment, not a literal cetasika. Do not substitute desire (chanda), attention (manasikara), deliberative thinking, permission checks or execution for intention.

## Incorrect current boundary

`considerLocal` is a command/routine interpreter. `validateProposal` is a proposal constraint check. Both are useful infrastructure, but neither constitutes intention formation. They belong to vaca and sikkha respectively. Model proposals remain proposals until the runtime adopts a bounded decision. Moving files is only ownership repair, not completion of cetana.

The older prototype's `cetana-service.ts` maps a boolean to READ/WAIT. Its caller is the preserved legacy recall path. It must not be cited as the continuing runtime's intention implementation; replace that legacy path coherently rather than deleting a function while leaving its caller broken.

## Required engineering behavior

- CE-01: Distinguish an available possibility, a suggested action, a chosen direction, a durable task and an executed effect. Provider success establishes none of the latter by itself.
- CE-02: Bind each adopted intention to the current object and concern, with attributable motives, evidence and explicit uncertainty. Unknown motives remain unknown; do not invent explanatory histories.
- CE-03: Represent the purpose and expected consequence of the proposed direction, including who or what is affected. Expected consequences remain predictions until actual feedback exists.
- CE-04: Consider relevant alternatives, including restraint, clarification and further observation. Do not demand a fixed artificial count of alternatives for a greeting or pretend every routine response involved lengthy deliberation.
- CE-05: Record why a direction is adopted, revised, deferred or abandoned. A candidate desire does not itself grant authority, and a pleasant modeled appraisal does not establish beneficial consequences.
- CE-06: Sustain the commitment across interruptions without treating it as an unchanging intention. Changed evidence, operator correction and actual outcomes can warrant revision. Preserve the original criterion and version lineage.
- CE-07: Keep before-action consideration, during-action checks and after-action review connected by decision/action/result IDs. Unknown effects require reconciliation, not blind retries.
- CE-08: Reflect on consequences through actual feedback and retained memory; do not claim learning because a paragraph says "I learned". Future inclination changes require an attributable update with scope and reversal behavior.
- CE-09: Preserve the single foreground owner and existing Stop/Pause, generation/version fencing, contact controls and scoped authorization. Internal aspirations cannot grant release, credential or executable self-upgrade authority.
- CE-10: Show concise purpose, selected direction, reason and observed outcome in activity. Do not expose invented private thought or label inferred motives as observed facts.

## Boundary and acceptance scenarios

Vaca interprets communication. Sati supplies sourced memory. Manasikara supplies the object orientation. Chanda supplies attributable interests and motives. Cetana must coordinate an adopted direction in that context. Sikkha independently checks constraints. Vithi persists state transitions. Kamma carries out permitted effects. Paccavekkhana reviews actual outcomes. Associated domain facets refer to one decision/object; the module list is not a literal sequential account of mental factors.

1. A greeting receives a bounded routine response; no fictional multi-option deliberation record is added.
2. A desire to investigate a company competes with a new operator question: answer the question, retain the displaced concern, and record a justified return or revision.
3. A proposed desktop click has no current screenshot: observation is required before input; calling the click an intention does not authorize execution.
4. A model suggests a useful improvement: retain a proposal, not a release commitment or a successful code change.
5. An action times out with uncertain effect: reconcile; never count a repeated attempt as progress without evidence.
6. An operator corrects a premise: revise the direction and preserve source/decision lineage; do not defend the obsolete plan through fluent prose.
7. A reflection repeats an unsupported conclusion: record the remaining uncertainty and select evidence, a necessary question or a justified stopping point. Repetition is not learning.
8. An attractive proposal has foreseeable adverse consequences: retain the concern while choosing restraint or a safer alternative; no simplistic pleasant/unpleasant mapping decides the action.

## Implementation sequence and current limit

First relocate communication routines and proposal constraints to their actual owners, preserving behavior and replay imports. Then design an explicit intention contract integrated with adoption, interruption, action/result review and durable inclination updates. Do not add decorative fields filled with copies of `reason`, fabricated alternatives or a numeric wisdom score. Persistence changes and semantic acceptance must follow that contract.

This slice corrects ownership only. Full CE-01 through CE-10 remain pending and require scenario-based verification when execution is authorized. Existing tests do not certify these requirements. No test/build/service execution is authorized by this documentation change.
