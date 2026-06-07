# <Capability> — Spec Delta

> Change delta for one capability. Lives at `specs/changes/<change-id>/specs/<capability>/spec.md`.
> Only include the sections you actually use. `spec-archive` applies these to the living spec at
> `specs/specs/<capability>/spec.md`:
> ADDED → insert, MODIFIED → replace the matching `### Requirement:` block, REMOVED → delete it.
> Requirement names MUST match the living spec exactly for MODIFIED/REMOVED.

## ADDED Requirements

### Requirement: <New Behavior>

The system SHALL <new observable behavior>.

#### Scenario: <Case>

- GIVEN <state>
- WHEN <action>
- THEN <outcome>

## MODIFIED Requirements

### Requirement: <Existing Behavior Name>

The system MUST <updated behavior>.
(Previously: <old behavior, one line>)

#### Scenario: <Case>

- GIVEN <state>
- WHEN <action>
- THEN <new outcome>

## REMOVED Requirements

### Requirement: <Deprecated Behavior>

(Reason: <why it is being removed; where the behavior moved, if anywhere>)
