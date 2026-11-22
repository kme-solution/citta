# Vaca (ဝါစာ) — coding and implementation design

**State:** documentation and read-only source assessment; proposed changes are not implemented by this file. Behavioral authority is the [digital model](02-digital-model.md); research belongs to the [Myanmar explanation](01-buddhist-explanation.md). Application execution requires the existing explicit-authorization gate.

## Current code and gap

`vaca/interpret.ts` contains sufficient local routines. Speech rendering and old interpretation/adviser files still live in `cetana/`. Current message publication and proactive contact are coordinated by vithi/repository. The namespace is therefore only partly corrected; adviser process transport is infrastructure, not intention or speech semantics.

## Proposed record and interfaces

Define interpreted routine candidates separately from OutgoingSpeech containing decision ID, source/evidence references, conversation, optional reply target and delivery class. Preserve text, uncertainty and adviser attribution without leaking private configuration. Publication receipts distinguish queued, published and acknowledged states; do not equate generating text with delivery.

## Integration and state transitions

Dvara admits operator input; sanna resolves referents; sufficient routines/cognition offer candidates; cetana coordinates direction; sikkha checks boundaries; vaca renders honest speech; vithi persists/publishes under contact policy. Dashboard reads actual published initiatives/questions/reports and links back to source context.

## Failure, recovery and compatibility

Duplicate send requests preserve message identity and do not publish twice. An invalid reply target cannot silently select another concern. Provider failures retain the operator message and honest blockage. Keep Enter focus/IME behavior in the portal; UI receipts are not substantive answers. Legacy portal behavior stays isolated until explicitly retired.

## Delivery slices and verification gates

1. Finish semantic ownership mapping for rendering, routines, publication and transport.
2. Move misplaced speech helpers only with their callers; isolate adviser adapters under infrastructure.
3. Verify context-sensitive replies, truthful delivery states, proactive pacing and portal input behavior.

Acceptance is defined by VA-01 onward and the VA-C scenarios in document 02. When execution is authorized, start with meaningful focused checks, then isolated persistence/integration checks where needed, then actual provider/portal observation for semantic behavior. Catalog-only checks should inspect authoritative data and representative classifications. Never claim a runtime outcome from this source review.

No application source, dependency, migration or running service is changed by this documentation. Keep historical records, private configuration and applied migration checksums intact. Proposed API/schema changes require explicit compatibility and version handling in their implementation slice. Actual completion, limitations and the next safe task remain in the existing delivery status document.
