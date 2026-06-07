# Design: <change title>

- **Change ID:** <verb-led-kebab-id>
- **Proposal:** ./proposal.md
- **Status:** draft | approved

> Technical design that satisfies the proposal, grounded in this repo's architecture
> (`AGENTS.md`, `.github/instructions/architecture-guide.instructions.md`,
> `.vscode/__templates__/`). Optional for trivial changes. The "how", not the task list.

## Context

<What in the current code is relevant. Constraints, existing patterns to reuse, prior art.>

## Decisions

- **Decision:** <what you chose>. **Why:** <rationale>. **Alternatives considered:** <a, b>.
- ...

## Affected areas

- **Module:** `src/app/modules/<name>/<name>.module.ts` — wired into `src/app/app.module.ts`
- **Controller:** `src/app/modules/<name>/<name>.controller.ts` (thin; `@ApiKey()` /
  `@AllowAnonymous()`) + OpenAPI in `<name>.controller.docs.ts`
- **Service / provider:** `src/app/modules/<name>/<name>.service.ts` — business logic via DI
- **DTOs / schemas:** `src/app/modules/<name>/<name>.dto.ts` — `ZodDto(schema, 'Model')`
- **Outbound data:** `#libs/http` clients injected into services (no ORM/database layer)
- **Guards / interceptors / pipes:** `src/app/decorators/*` / `src/libs/decorators` (`createSecurityGuard()` from `#libs/decorators`)
- **Shared libs touched:** `#libs/zod` · `#libs/http` · `#libs/decorators`

## Data & validation

- Zod schemas and `ZodDto` shapes, input validation at the edge (`ZodValidationPipe`),
  and any computed fields. See the `zod-schema` skill.

## Configuration & DI (if applicable)

- Config read only in `src/app/config/` (validated by a Zod schema), provided via `useFactory`
  and consumed through constructor injection. See the `ioc-binding` skill.

## Testing strategy

- Which requirements/scenarios map to which Vitest `*.spec.ts` files (colocated with source),
  with typed mocks (`vitest-mock-extended`), including outbound `#libs/http`. Target ≥ 80% coverage.
  See the `vitest-tdd` skill.

## Risks / trade-offs

- <Error handling (NestJS HTTP exceptions), config/DI wiring, performance,
  security (API key / anonymous), edge cases, rollback.>
