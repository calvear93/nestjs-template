# Skill: SDD — Verify

Confirm the implementation satisfies the spec and the project's quality gates.

## When to use

After `/implement`, when all tasks are checked. Input: the feature's `spec.md` + `tasks.md`.

## Procedure

1. **Run the quality gate:**
    ```bash
    pnpm lint
    pnpm format
    pnpm test:dev --coverage --run
    ```
    All must pass. Report real output — do not claim green without running.
2. **Trace acceptance criteria → tests.** For each criterion in `spec.md`, confirm a passing
   test exercises it (use the traceability table in `tasks.md`). Flag any uncovered criterion.
3. **Coverage check:** touched code ≥ 80%; assertions are meaningful (would fail if logic
   broke). Optionally run `pnpm test:mutation` for critical logic.
4. **Spot-check best practices:** controllers thin + business logic in services; config
   injected via providers (no hardcoded values / no `process.env` outside `src/app/config/`);
   inputs validated through `ZodDto`; errors thrown as NestJS HTTP exceptions; no `any` left
   where a real type fits.
5. **Mark the spec `implemented`** (status field) when everything passes.

## Output

- Pass/fail per gate with the actual command output.
- A criterion-by-criterion coverage table (covered / missing).
- Any follow-ups or deferred items. If gaps exist, loop back to `/tasks` or `/implement`.
