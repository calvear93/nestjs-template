# AGENTS.md

Canonical, tool-agnostic instructions for every AI assistant in this repo. `CLAUDE.md` and
`GEMINI.md` only import this file; skills live in [`.ai/`](.ai/README.md). User instructions
win over this file, this file wins over existing code patterns.

**NestJS 12 API template on Fastify**: Zod-validated edges, OpenAPI docs, DI everywhere.

## Stack

NestJS 12 + `@nestjs/platform-fastify` (never Express) · TypeScript 6 (strict, ESM) · Zod 4
via Nest's Standard Schema support · `@nestjs/swagger` · Vitest 5 + `vitest-mock-extended` ·
Stryker · Vite 8 + vite-node · `@calvear/env` · Luxon · Node ≥ 24, pnpm ≥ 12. No ORM.

## Commands

```bash
pnpm start:dev                  # dev server, watch mode (http://localhost:4004/api)
pnpm test:dev --run [path]      # tests once (drop --run for watch)
pnpm test:mutation              # Stryker, for critical logic
pnpm lint --fix                 # ESLint + Prettier (style is enforced here)
pnpm env:schema                 # after adding or renaming an env var
pnpm build                      # production build (dist/)
```

**Gate** (must be green before a change is done):
`pnpm lint && pnpm build && pnpm test:dev --coverage --run`

## Layout

```
src/main.ts, src/app/app.ts     bootstrap: global pipe, versioning, prefix, Swagger
src/app/modules/<name>/         <name>.module.ts + controllers/ services/ schemas/
src/app/modules/index.ts        module registry (also add to AppModule.imports)
src/app/decorators/             ApiKey / AllowAnonymous, ApplyControllerDocs
src/libs/{zod,http,decorators}  #libs/* (each has a README: the API reference)
src/__tests__/                  #testing helpers + app-level integration tests
env/                            appsettings.json + <env>.env.json (see env/README.md)
.vscode/__templates__/          scaffolds: start every new file from one
```

The reference implementation is `src/app/modules/sample/`.

## Rules (the ones lint can't check)

- **Config:** never hardcode URLs, keys or settings. Read `process.env` only at module level
  (`const X = process.env.X` at the top of the file, lint-enforced) or inject it via DI. See the
  [`config-di`](.ai/skills/config-di.md) skill.
- **Edges:** every input is a Zod schema bound with `@Body`/`@Query`/`@Param({ schema })`, with
  no DTO classes and no manual `.parse()`. See [`zod-openapi`](.ai/skills/zod-openapi.md).
- **Thin controllers, rich services.** Errors are NestJS HTTP exceptions; let them propagate.
  Log with `new Logger(X.name)`, never `console`.
- **Docs:** every endpoint is documented in a colocated `*.controller.docs.ts`.
- **Security:** put `@ApiKey()` on the controller class and `@AllowAnonymous()` on public routes.
- **External APIs:** use the injected `HttpClient` from `#libs/http`, never raw `fetch`.
- **Tests:** ship tests with the code, ≥ 80% coverage. See [`testing`](.ai/skills/testing.md).
- **Types:** prefer `unknown` or generics. `any` (a lint warning) is fine when an exact type
  adds complexity without safety. No `@ts-expect-error`/`eslint-disable` to dodge an error.
- **YAGNI:** make minimal, atomic changes, with no speculative abstractions or new deps
  without a reason.
- **Style is tooling-owned:** formatting, import order, member order and naming of files are
  enforced by ESLint/Prettier. Run `pnpm lint --fix` instead of hand-formatting.

## Language

Code, comments, docs and commits are in **English**. Exception: business-domain terms the user
defines as entities (e.g. `Siniestro`) keep their original name. Talk to the user in their
language.

## Commits

Conventional Commits + Gitmoji: `<type>(<scope>) <gitmoji>: <description>`, e.g.
`feat(auth) ✨: add API key guard`, `fix(users) 🐛: …`, `refactor(http) ♻️: …`, `test ✅`,
`docs 📚`, `chore(deps) 🔧`. For non-trivial changes, add `Refs: docs/changes/<file>.md` to the
commit body.

## How to work

Follow [`ways-of-working`](.ai/skills/ways-of-working.md): autonomy, right-sizing a change,
change records ([`docs/changes/`](docs/changes/README.md)), and the Definition of Done.
