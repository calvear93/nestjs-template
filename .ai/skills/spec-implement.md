# Skill: Spec — Implement

Execute the change's task list with a test → implement → refactor loop, reusing the template's
existing prompts. This is the only lifecycle skill with **stack-specific** commands.

## When to use

After `/spec-tasks`. Input: `specs/changes/<change-id>/tasks.md`.

## Stack quality gates — NestJS + TypeScript

The implement loop runs against the local toolchain (Vitest, ESLint, Prettier, Vite):

```bash
pnpm install                     # first run / after dependency changes
pnpm test:dev --run              # run the Vitest suite once (pnpm test:dev <pattern> to filter)
pnpm build                       # production build (Vite) — catches type/build errors
pnpm lint                        # ESLint (fix, cached)
pnpm format                      # Prettier (write)
```

> Porting to another stack: replace only this section and the per-step commands below with the
> repo's build/test/lint loop. The rest of the procedure is stack-agnostic.

## Procedure

Work tasks **in order**. For each unchecked task:

1. **Red** — write or adjust the Vitest `*.spec.ts` named in the task first (colocated with the
   source). Run it and watch it fail for the right reason (`pnpm test:dev --run`, or
   `pnpm test:dev <pattern>` to filter). See the `vitest-tdd` skill.
2. **Green** — implement the minimum to pass, reusing the matching prompt instead of
   reinventing patterns:
    - Module → `.ai/prompts/create-module.md`
    - Endpoint → `.ai/prompts/create-api-endpoint.md`
    - OpenAPI docs → `.ai/prompts/api-documentation.md`
    - Error handling → `.ai/prompts/error-handling.md`
    - Tests → `.ai/prompts/testing-strategy.md`
    - Zod schemas → `zod-schema` skill · DI/wiring → `ioc-binding` skill · NestJS patterns → `nestjs` skill
3. **Refactor** — clean up while green; keep controllers thin, business logic in services,
   config injected via providers (never hardcoded / no `process.env` outside `src/app/config/`).
4. **Conform to the conventions** (`AGENTS.md` Code style + `coding-standards`): tabs (width 4),
   single quotes, semicolons, trailing commas; `.ts` extension on relative imports;
   `#libs/*` aliases; no `any`; inputs validated through `ZodDto`; NestJS
   HTTP exceptions for the error path; no `console.log` (use the NestJS `Logger`). Run
   `pnpm lint` and `pnpm build` as you go and fix every error before moving on.
5. **Check the task off** in `tasks.md`, run `pnpm test:dev --run`, and move on.

Keep changes minimal and atomic. If reality diverges from the design, note it and, if material,
update `design.md`/`tasks.md` — and update the **deltas** if the observable behavior itself
changed (the deltas must still describe what you shipped). Do not silently drift.

## Output

- Summary of files changed per task and current build/test status.
- **Next step:** `/spec-archive` once all tasks are checked.
