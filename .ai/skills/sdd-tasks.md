# Skill: SDD — Tasks

Break an approved plan into atomic, ordered, **test-first** tasks.

## When to use

After `/plan`. Input: `specs/NNN-<slug>/plan.md` (+ `spec.md`).

## Procedure

1. **Read** the plan and spec.
2. **Write `specs/NNN-<slug>/tasks.md`** from `.ai/templates/tasks.template.md`.
3. **Make each task atomic and verifiable:**
    - One coherent unit (a DTO/schema, a config provider, a service, a controller, module
      wiring) — small enough to implement and test in isolation.
    - **Test-first:** each task names the `*.spec.ts` it adds/updates and the acceptance
      criterion it covers.
    - Explicit "done when" (an assertion or observable outcome).
4. **Order by dependency:** schemas/DTOs → config/providers → services → controllers →
   module wiring/registration → integration. A task should not depend on a later one.
5. **Ensure full traceability:** every acceptance criterion in `spec.md` maps to ≥ 1 task in
   the traceability table. No orphan criteria, no tasks without a criterion.
6. **Keep scope honest:** if a task is large or vague, split it. Note anything deferred.

## Output

- The tasks path, the task count, and confirmation that the traceability table covers every
  acceptance criterion.
- **Next step:** `/implement`.
