# Skill: Spec — Tasks

Break an approved change into atomic, ordered, **test-first** tasks.

## When to use

After `/spec-design` (or directly after `/spec-propose` for trivial changes). Input:
`specs/changes/<change-id>/` (`proposal.md` + deltas + `design.md` if present).

## Procedure

1. **Read** the proposal, deltas, and design.
2. **Write `specs/changes/<change-id>/tasks.md`** from `.ai/templates/tasks.template.md`.
3. **Make each task atomic and verifiable:** - One coherent unit (a module, a controller, a service/provider, a DTO/Zod schema, a guard
   or interceptor, a utility) — small enough to implement, build,
   and test in isolation. - **Test-first:** each task names the Vitest `*.spec.ts` file it adds/updates (colocated
   with the source) and the delta requirement it covers (`<capability> › <Requirement
name>`). - Explicit "done when" (a passing assertion and a clean typecheck/build).
4. **Order by dependency:** DTOs/Zod schemas → services/providers →
   controllers → module wiring (`app.module.ts`) → OpenAPI docs → integration. A task should
   not depend on a later one.
5. **Ensure full traceability:** every requirement/scenario in the change deltas maps to ≥ 1
   task in the traceability table. No orphan requirements, no tasks without a requirement.
6. **Keep scope honest:** if a task is large or vague, split it. Note anything deferred.

## Output

- The tasks path, the task count, and confirmation that the traceability table covers every
  delta requirement.
- **Next step:** `/spec-implement`.
