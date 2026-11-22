# Nama (နာမ) နှင့် configured profile — coding and implementation design

**State:** documentation and read-only source assessment; proposed changes are not implemented by this file. Behavioral authority is the [digital model](02-digital-model.md); research belongs to the [Myanmar explanation](01-buddhist-explanation.md). Application execution requires the existing explicit-authorization gate.

## Current code and gap

`nama-service.ts` loads name, age, gender, background, occupation, location, language, values and goals from environment; validates age; renders profile answers. Config and provider prompts use this Identity type. This is real configuration functionality under a conceptually misleading owner.

## Proposed record and interfaces

Preserve Identity and profile-version references while proposing a conventional-profile contract associated with pannatti. A naming migration should define compatibility exports and update callers in one slice. Reserve doctrinal nama explanation for reference/model composition; do not duplicate every associated facet into another mutable database.

## Integration and state transitions

Environment/config loader validates allowlisted attributes; runtime pins the profile version to consideration; sufficient identity routines respond without inference. Provider context uses the same pinned identity and cannot override it with older thread contents. Approved profile change invalidates stale candidate assumptions through current version handling.

## Failure, recovery and compatibility

Invalid configured age should fail explicit validation rather than become a guessed value. Unknown optional attributes remain unknown in both languages. Do not rewrite historical profile versions after a configuration change. Existing env keys remain supported across code ownership changes.

## Delivery slices and verification gates

1. Specify the conventional-profile owner and all import/configuration compatibility points.
2. Move profile behavior coherently with versioned adapters; leave doctrinal nama explanation separate.
3. Verify unknown attributes, pinned profile versions, prompt minimization and legacy API compatibility.

Acceptance is defined by NA-01 onward and the NA-C scenarios in document 02. When execution is authorized, start with meaningful focused checks, then isolated persistence/integration checks where needed, then actual provider/portal observation for semantic behavior. Catalog-only checks should inspect authoritative data and representative classifications. Never claim a runtime outcome from this source review.

No application source, dependency, migration or running service is changed by this documentation. Keep historical records, private configuration and applied migration checksums intact. Proposed API/schema changes require explicit compatibility and version handling in their implementation slice. Actual completion, limitations and the next safe task remain in the existing delivery status document.
