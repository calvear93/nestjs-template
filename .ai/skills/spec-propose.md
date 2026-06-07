# Skill: Spec — Propose

Turn a request into a stored **change proposal** with spec **deltas**. **What and why, never
how.** This is the first step of every spec-driven request — the "migration" that captures the
intent and the behavior change as durable memory.

## When to use

First step of any new feature, fix, or behavior change. Input: a one-line idea or request.
Output: a `specs/changes/<change-id>/` folder. Read `spec-conventions` first.

## Procedure

1. **Read current truth.** Read `specs/project.md` and the relevant capability specs under
   `specs/specs/`. Decide which capability(ies) this change touches — new or existing. Skim
   `specs/changes/` so you don't collide with an in-flight change.
2. **Clarify if underspecified.** If scope, users, or success are unclear, ask **up to 3**
   focused questions before writing. Do not invent requirements silently.
3. **Allocate a change-id.** Lowercase, hyphenated, **verb-led** (`add-…`, `refactor-…`,
   `remove-…`, `fix-…`), unique across `specs/changes/` + `archive/`. Create
   `specs/changes/<change-id>/`.
4. **Write `proposal.md`** from `.ai/templates/proposal.template.md`: **Why** (problem, why
   now), **What Changes** (observable behavior deltas), **Impact** (affected capabilities,
   code areas, risks, out-of-scope). No class names or libraries — that is `/spec-design`.
5. **Write the spec deltas** under `specs/changes/<change-id>/specs/<capability>/spec.md` from
   `.ai/templates/delta.template.md`:
    - New behavior → `## ADDED Requirements` (full `### Requirement:` + `#### Scenario:` blocks).
    - Changed behavior → `## MODIFIED Requirements` (requirement name **matching the living
      spec exactly**, full new body, `(Previously: …)`).
    - Dropped behavior → `## REMOVED Requirements` (name + `(Reason: …)`).
    - Scenarios are GIVEN/WHEN/THEN so they map 1:1 to Vitest test cases later.
6. **Respect `AGENTS.md`** — language policy (code and docs in English; preserve only
   user-defined business-domain terms) and the type-safety/configuration rules when describing
   data flow.
7. **Validate** against the `spec-conventions` checklist. Resolve all Open questions before
   asking for approval.

## Output

- The change path; the capabilities touched; counts of ADDED/MODIFIED/REMOVED requirements.
- Any unresolved open questions.
- **Next step:** `/spec-design` (skip for trivial changes) → `/spec-tasks` once approved.
