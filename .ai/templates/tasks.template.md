# Tasks: <feature name>

- **Spec:** ./spec.md · **Plan:** ./plan.md
- **Status:** draft | in progress | done

> Atomic, ordered tasks. Each task is small, independently verifiable, and **test-first**
> (write/adjust the test, then the implementation). Check off as you go.

## Tasks

- [ ] **T1 — <title>**
    - Files: `<path(s)>`
    - Test: `<*.spec.ts>` covering acceptance criterion #<n>
    - Done when: <observable outcome / assertion passes>
- [ ] **T2 — <title>**
    - Files: `<...>`
    - Test: `<...>`
    - Done when: <...>
- [ ] ...

## Traceability

Every acceptance criterion in `spec.md` must be covered by at least one task/test.

| Acceptance criterion | Task(s) |
| -------------------- | ------- |
| #1                   | T?      |
| #2                   | T?      |

## Definition of done

- [ ] All tasks checked and tests green (`pnpm test:dev --coverage --run`).
- [ ] `pnpm lint` and `pnpm format` clean.
- [ ] Coverage ≥ 80% on touched code; meaningful assertions.
- [ ] Every acceptance criterion traces to a passing test.
