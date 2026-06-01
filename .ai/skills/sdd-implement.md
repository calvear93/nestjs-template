# Skill: SDD — Implement

Execute the task list with a test-first (TDD) loop, reusing the template's existing prompts.

## When to use

After `/tasks`. Input: `specs/NNN-<slug>/tasks.md`.

## Procedure

Work tasks **in order**. For each unchecked task:

1. **Red** — write or adjust the test named in the task first; run it and watch it fail
   (`pnpm test:dev --run`). See the `vitest-tdd` skill for structure and mocking.
2. **Green** — implement the minimum to pass. Reuse the matching prompt instead of
   reinventing patterns:
    - Module → `.github/prompts/module-creation.prompt.md`
    - Endpoint → `.github/prompts/api-endpoint-creation.prompt.md`
    - OpenAPI docs → `.github/prompts/api-documentation.prompt.md`
    - Errors → `.github/prompts/error-handling.prompt.md`
    - Tests → `.github/prompts/testing-strategy.prompt.md`
    - Schemas → `zod-schema` skill · DI → `ioc-binding` skill
3. **Refactor** — clean up while green; keep controllers thin, business logic in services,
   config injected via providers (never hardcoded / no `process.env` outside `src/app/config/`).
4. **Conform to the lint contract** (this repo's ESLint): inline `type` imports, single
   quotes, lowercase comments, `Number.parseInt`, sorted imports, `node:` protocol, no
   `console.log` (use the NestJS `Logger`), `for...of` over `.forEach`, NestJS HTTP
   exceptions with messages, no `any`. Run `pnpm lint` as you go.
5. **Check the task off** in `tasks.md` and move on.

Keep changes minimal and atomic. If reality diverges from the plan, note it and, if material,
update `plan.md`/`tasks.md` rather than silently drifting.

## Output

- Summary of files changed per task and current test status.
- **Next step:** `/verify` once all tasks are checked.
