# Skill: Spec — Design

Turn an approved proposal into a technical design. **How, grounded in this template's
architecture.** Optional for trivial changes.

## When to use

After `/spec-propose`, once `proposal.md` + deltas are approved and the change is non-trivial
(new module, controller, service, DTO/schema, guard/interceptor, cross-cutting
refactor). Skip it for a doc-only or one-line behavior tweak — note the skip in `tasks.md`.
Input: `specs/changes/<change-id>/`.

## Procedure

1. **Read** the proposal, its deltas, the target living specs under `specs/specs/`, plus
   `AGENTS.md` and `.github/instructions/architecture-guide.instructions.md`. Explore the
   relevant existing code (`src/app/modules/`, `src/libs/`) and the canonical scaffolds in
   `.vscode/__templates__/` before designing.
2. **Write `specs/changes/<change-id>/design.md`** from `.ai/templates/design.template.md`.
3. **Design within the NestJS feature-module layout (`src/app`, `src/libs`):**
    - **Feature modules** in `src/app/modules/<name>/` use a **flat layout** — colocate
      `<name>.module.ts`, `<name>.controller.ts`, `<name>.controller.docs.ts`,
      `<name>.service.ts`, `<name>.dto.ts`, and `<name>.spec.ts` (no `controllers/`,
      `services/`, `schemas/` subfolders). Wire the module into `src/app/app.module.ts`.
    - **Controllers** stay thin: HTTP concerns only, delegating to services. Apply `@ApiKey()`
      at the controller level; mark public endpoints with `@AllowAnonymous()`. OpenAPI lives in
      a colocated `<name>.controller.docs.ts`.
    - **Services / providers** hold business logic, injected through NestJS DI
      (constructor injection) — never hardcode config or read `process.env` outside
      `src/app/config/`. See the `ioc-binding` skill.
    - **DTOs / validation** are `ZodDto` classes (`ZodDto(schema, 'Model')`) validated at the
      edge via `ZodValidationPipe`. See the `zod-schema` skill.
    - **Outbound data** is fetched through `#libs/http` clients injected into services; this
      template ships no ORM/database layer — keep external access inside services, not controllers.
    - **Guards / interceptors / pipes** for cross-cutting concerns; build custom guards with
      `createSecurityGuard()` from `#libs/decorators`.
    - **Shared code** goes in `src/libs/*` (`#libs/zod`, `#libs/http`, `#libs/decorators`).
4. **Record decisions** explicitly (what / why / alternatives) so the change folder is the
   durable rationale.
5. **Map requirements → testing strategy** (Vitest `*.spec.ts` colocated with source, typed
   mocks via `vitest-mock-extended` — including outbound `#libs/http`; target ≥ 80% coverage).
   See the `vitest-tdd` skill.
6. **Call out risks/trade-offs:** error handling (NestJS HTTP exceptions), config/DI wiring,
   type safety (no `any`), security (API key / anonymous), and rollback.
7. **Stay minimal (YAGNI).** No task list yet — that is `/spec-tasks`.

## Output

- The design path and a short summary of the approach + affected modules/files.
- Flag any proposal ambiguity discovered (loop back to `/spec-propose` if material).
- **Next step:** `/spec-tasks`.
