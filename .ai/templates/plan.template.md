# Plan: <feature name>

- **Spec:** ./spec.md
- **Status:** draft | approved

> Technical design that satisfies the spec. Respect `AGENTS.md` and
> `.github/instructions/architecture-guide.instructions.md`. No task breakdown here (that is
> `/tasks`).

## Approach

<High-level technical approach in a few sentences. Note the key decision(s) and why.>

## Affected areas

- **Module:** `src/app/modules/<feature>/` — <new/changed>
- **Controllers:** `<feature>.controller.ts` — thin, `@ApiKey()`, HTTP only
- **Services:** `<feature>.service.ts` — business logic
- **DTOs (Zod):** `schemas/<feature>.dto.ts` — `ZodDto` classes
- **OpenAPI docs:** `<feature>.controller.docs.ts` — Swagger metadata
- **Config:** providers in `src/app/config/` (`useFactory`, never `process.env` in services)
- **Module wiring:** registration in `src/app/app.module.ts`
- **Libs touched:** `#libs/zod` · `#libs/http` · `#libs/decorators`

## Data & validation

- Zod schemas as `ZodDto(schema, 'Name')` (and create/update variants). Validated by the
  globally registered `ZodValidationPipe`. See the `zod-schema` skill.

## Dependency injection

- New services/config providers and where they bind/register (`@Injectable()`, `useFactory`,
  module `providers`/`exports`). Never hardcode config. See the `ioc-binding` skill.

## Testing strategy

- Which acceptance criteria map to which tests (Vitest + `vitest-mock-extended`). See the
  `vitest-tdd` skill.

## Risks / trade-offs

- <Edge cases, performance, security, migration concerns.>
