# Skill: Spec — Conventions

The OpenSpec format and folder model used by this repo. **Reference skill** — read it when
writing or validating any spec, delta, proposal, or change. The lifecycle skills
(`spec-propose`, `spec-design`, `spec-tasks`, `spec-implement`, `spec-archive`) all assume it.

## When to use

Before writing a living spec, a change proposal, or a spec delta — and whenever you need to
validate that an artifact is well-formed.

## Folder model (root is `specs/`)

```
specs/
  project.md                       # stable project context (read first)
  specs/                           # LIVING TRUTH — what IS built
    <capability>/spec.md           # one folder per capability
  changes/                         # PROPOSALS — like DB migrations
    <change-id>/
      proposal.md                  # Why / What Changes / Impact
      design.md                    # technical decisions (optional)
      tasks.md                     # ordered, test-first tasks
      specs/<capability>/spec.md   # DELTAS: ## ADDED|MODIFIED|REMOVED Requirements
    archive/
      YYYY-MM-DD-<change-id>/       # shipped changes (deltas already applied to ../../specs)
```

- **Living specs** (`specs/specs/`) describe current truth. They never contain ADDED/MODIFIED
  markers. They are edited **only** by `spec-archive` applying a change's deltas.
- **Changes** (`specs/changes/`) are the unit of work. Everything a request needs — intent,
  design, tasks, and the spec deltas — lives in one change folder, the durable memory of the
  decision (the "migration").

> Note: the `specs/specs/` nesting is intentional — it mirrors OpenSpec's `openspec/specs/`
> so the optional `openspec` CLI stays usable. Don't "flatten" it.

## Capability naming

- Lowercase, hyphenated, noun-led, behavior-oriented: `user-export`, `auth-session`,
  `order-ingestion`. One capability = one coherent area of behavior, not one class.

## Change-id naming

- Lowercase, hyphenated, **verb-led**: `add-user-export`, `refactor-auth-session`,
  `remove-legacy-import`, `fix-order-dedup`. Unique within `specs/changes/` (+ archive).

## Requirement & scenario format (living specs and ADDED/MODIFIED deltas)

```markdown
### Requirement: <Behavior Name>

The system SHALL <observable behavior>.

#### Scenario: <Scenario Name>

- GIVEN <precondition>
- WHEN <action>
- THEN <observable outcome>
- AND <additional outcome, optional>
```

- Use **RFC 2119** keywords: `SHALL` / `MUST` (mandatory), `SHOULD` (recommended), `MAY`
  (optional). Prefer "The system SHALL …".
- Every `### Requirement:` has **at least one** `#### Scenario:`. Scenarios are
  GIVEN/WHEN/THEN so they map 1:1 to test cases.
- Keep it implementation-free: behavior, contracts, constraints — no class names or libraries
  (those belong in `design.md`).

## Delta format (in `specs/changes/<id>/specs/<capability>/spec.md`)

```markdown
## ADDED Requirements

### Requirement: <new name> # full requirement + scenarios

## MODIFIED Requirements

### Requirement: <existing name> # must match the living spec name EXACTLY; full new body

(Previously: <old behavior, one line>)

## REMOVED Requirements

### Requirement: <existing name> # name only + reason

(Reason: <why>)
```

- Include only the sections you use. A capability that's brand-new uses only `## ADDED`.
- For `MODIFIED`/`REMOVED`, the `### Requirement:` name **must match** the living spec
  verbatim, or archiving cannot locate the block.

## Validation checklist (what `valid` means)

- [ ] Change folder has `proposal.md` and `tasks.md`; `design.md` present if non-trivial.
- [ ] At least one delta under `specs/changes/<id>/specs/<capability>/spec.md`.
- [ ] Every delta requirement has a name and (for ADDED/MODIFIED) ≥ 1 scenario.
- [ ] MODIFIED/REMOVED names exist in the target living spec (`specs/specs/<capability>/spec.md`).
- [ ] No implementation detail in `proposal.md` / deltas (that's `design.md`).
- [ ] `proposal.md` has no unresolved Open questions.

## No CLI — skills are the engine

The official `openspec` CLI (`@fission-ai/openspec`) is **intentionally not wired in**: it
hardcodes an `openspec/` root (`OPENSPEC_DIR_NAME = 'openspec'`, no flag/env override) and
cannot target this repo's `specs/` root. The skills here are the authoritative engine — use the
validation checklist above and `spec-archive`'s procedure to validate and apply changes. (A
team that prefers the CLI would rename the root to `openspec/` and re-add the dependency; the
folder structure here is otherwise CLI-compatible.)
