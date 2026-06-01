# Skill: SDD — Plan

Turn an approved spec into a technical design. **How, grounded in this template's architecture.**

## When to use

After `/specify`, once `spec.md` is approved. Input: `specs/NNN-<slug>/spec.md`.

## Procedure

1. **Read the spec** and `AGENTS.md` + `.github/instructions/architecture-guide.instructions.md`.
   Explore the relevant existing code (`src/app/`, `src/libs/`) before designing.
2. **Write `specs/NNN-<slug>/plan.md`** from `.ai/templates/plan.template.md`.
3. **Design within the template's conventions:**
    - A feature lives in its own module under `src/app/modules/<feature>/` with
      `controllers/`, `services/`, and `schemas/`; shared code in `src/libs/`.
    - **Thin controllers, rich services** — controllers only handle HTTP (routing, status,
      `@Body()`/`@Query()`); business logic lives in `@Injectable()` services.
    - Data shapes as **`ZodDto`** classes (`zod-schema` skill); validated by the globally
      registered `ZodValidationPipe`. Derive create/update variants.
    - Every endpoint documented via a colocated **`*.controller.docs.ts`** OpenAPI file.
    - Dependencies via **NestJS DI** (`ioc-binding` skill) — config through `useFactory`
      providers in `src/app/config/`; never read `process.env` inside services/controllers.
    - Register the module in **`src/app/app.module.ts`**; secure controllers with `@ApiKey()`
      (mark public routes `@AllowAnonymous()`).
4. **Map acceptance criteria → testing strategy** (Vitest + `vitest-mock-extended`;
   `vitest-tdd` skill).
5. **Call out risks/trade-offs:** error paths (NestJS HTTP exceptions), performance, security
   (guards, input validation), edge cases.
6. **Stay minimal (YAGNI).** No task list yet — that is `/tasks`.

## Output

- The plan path and a short summary of the approach + affected areas.
- Flag any spec ambiguity discovered (loop back to `/specify` if needed).
- **Next step:** `/tasks`.
