# AGENTS.md

> Single source of truth for **all** AI coding assistants working in this repository
> (GitHub Copilot, Claude, Gemini, Codex, Cursor, and any agent that reads `AGENTS.md`).

This is a modern, production-ready **NestJS + TypeScript API template** running on Fastify.
It emphasizes type safety end-to-end with Zod, a modular feature architecture, NestJS
dependency injection, OpenAPI/Swagger documentation, and comprehensive testing.

## How to use this document

- This file is the canonical, tool-agnostic instruction set. `CLAUDE.md`, `GEMINI.md`,
  and `.github/copilot-instructions.md` are thin pointers to this file — **do not**
  duplicate guidance into them.
- Keep this file as the high-level contract (stack, rules, conventions). Long-form
  detail lives in the deep references at the bottom; link to them instead of repeating.
- User instructions (a direct request in chat) always take precedence over this file.

## Tech stack

| Area              | Choice                                                 |
| ----------------- | ------------------------------------------------------ |
| Framework         | NestJS 11+ with TypeScript 5+                          |
| HTTP server       | Fastify (`@nestjs/platform-fastify`)                   |
| Validation        | Zod 4+ via `#libs/zod` (`ZodDto`, `ZodValidationPipe`) |
| API docs          | OpenAPI / Swagger (`@nestjs/swagger`)                  |
| Dependency inject | NestJS built-in IoC container                          |
| HTTP client       | Built-in client via `#libs/http`                       |
| Dates             | Luxon                                                  |
| Testing           | Vitest + `vitest-mock-extended`                        |
| Coverage          | Vitest Coverage V8 (target ≥ 80%)                      |
| Mutation testing  | Stryker Mutator                                        |
| Build/runtime     | Vite + vite-node; Node `>=24`, pnpm `>=11`             |
| Env loading       | `@calvear/env` (`env/` folder)                         |
| Tooling           | ESLint + Prettier, pnpm                                |

## Commands

```bash
pnpm start:dev                   # dev server with hot reload (vite-node --watch)
pnpm start:release               # dev server (release environment)
pnpm test:dev                    # tests in watch mode
pnpm test:dev --run              # tests once (no watch)
pnpm test:dev --coverage --run   # tests once with coverage (CI/validation)
pnpm test:bench                  # benchmarks
pnpm test:mutation               # Stryker mutation tests (validate test quality)
pnpm lint                        # ESLint (cached)
pnpm format                      # Prettier (write)
pnpm env:schema                  # regenerate env JSON schema after config changes
pnpm build                       # production build
pnpm preview                     # build + run dist/main
```

Run `pnpm lint && pnpm format && pnpm test:dev --coverage --run` before finalizing
non-trivial changes.

## Project structure

```
src/
  app/
    app.module.ts        root module
    config/              configuration layer (the only place reading process.env)
    decorators/          app-level decorators (ApiKey, AllowAnonymous, ApplyControllerDocs)
    modules/             feature modules (controllers, services, schemas)
  libs/
    zod/                 #libs/zod  — ZodDto, ZodValidationPipe, custom validators
    http/                #libs/http — HttpClient, HttpModule, errors, enums
    decorators/          #libs/decorators — createSecurityGuard, ApplyToClass, DecoratorsLookUp
env/                     appsettings.json (non-secret) + <env>.env.json (secrets)
```

Path aliases (`package.json#imports`): `#libs/zod`, `#libs/http`, `#libs/decorators`,
`#testing`. See **architecture-guide** for full module topology and wiring.

## Core principles

- **Type safety first** — leverage TypeScript and Zod from API to data layer; never `any`.
- **Inject, never hardcode** — all config and dependencies flow through NestJS DI.
- **Thin controllers, rich services** — controllers handle HTTP; business logic lives in services.
- **Validate at the edge** — every input passes through a `ZodDto` / `ZodValidationPipe`.
- **Document every endpoint** — OpenAPI via a colocated `*.controller.docs.ts` file.
- **Test what you ship** — unit + integration tests with meaningful assertions (mutation-aware).
- **YAGNI** — minimal, atomic changes; no speculative abstractions.

## Critical rules

These are non-negotiable. Violations should be fixed before code is considered done.

### Configuration & dependency injection

- **NEVER** hardcode URLs, API keys, or configuration in services, controllers, or business logic.
- **NEVER** read `process.env` outside the dedicated config layer (`src/app/config/`).
- Define non-secret config in `env/appsettings.json`; secrets in `env/<env>.env.json`
  (this template ships `dev` and `release` as examples).
- Validate environment values with a Zod schema in the config layer.
- Provide config via NestJS dynamic providers (`useFactory`) and consume it through
  constructor injection. See **architecture-guide** → Configuration architecture.

### Language policy

- All code and documentation is in **English**: identifiers, comments, API names, errors, docs.
- **Exception:** preserve business-domain terms in their original language when the user
  explicitly defines them as domain entities (e.g. `Siniestro`, `Episodio`). Implementation
  around them stays in English.

### TypeScript & validation

- Explicit types everywhere; no `any` (prefer `unknown` + narrowing).
- All DTOs are `ZodDto` classes; provide a schema name for OpenAPI: `ZodDto(schema, 'Model')`.
- Prefer `async`/`await` over raw Promises; always handle the error path with proper
  NestJS HTTP exceptions.

### Security

- Apply `@ApiKey()` at the controller level; mark public endpoints with `@AllowAnonymous()`.
- Build custom guards with `createSecurityGuard()` from `#libs/decorators`.

## Code style (essentials)

- Tabs for indentation (width 4); single quotes; semicolons; trailing commas (all); ~80 col width.
- Arrow functions with parens around params; named exports preferred over default exports.
- Include `.ts` extension in relative imports; use `#libs/*` aliases for libraries.
- Import order: external packages → `#libs/*` → relative imports.
- Files `kebab-case`, classes/types `PascalCase`, methods/vars `camelCase`,
  module constants `SCREAMING_SNAKE_CASE`, private members prefixed `_`.

Full ruleset, file-suffix table, and anti-patterns: **coding-standards**.

## Testing

- Vitest + `vitest-mock-extended` (`mock<T>()`) for typed dependency mocks.
- Test services and controllers in isolation; mock injected dependencies.
- Use the arrange/act/assert structure and `// shared variables` / `// mocks` / `// hooks` /
  `// tests` section comments (see coding-standards). Target ≥ 80% coverage.
- Place `*.spec.ts` alongside source files.

Worked test recipes: **patterns** → Testing patterns.

## Commit conventions

Use **Conventional Commits with Gitmoji**:

```
<type>(<optional scope>) <gitmoji>: <description>
```

Examples:

```
feat(auth) ✨: add API key guard
fix(users) 🐛: resolve validation error on create
refactor(http) ♻️: extract retry logic
test(users) ✅: cover not-found path
chore(deps) 🔧: bump nestjs
```

Common types: `feat` ✨, `fix` 🐛, `docs` 📚, `style` 🎨, `refactor` ♻️, `perf` ⚡,
`test` ✅, `chore` 🔧, `ci`, `build`. Security 🔒, remove 🗑️, move 🚚.

## Deep references

| Document                                                                      | Scope                                                                         |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [Architecture guide](.github/instructions/architecture-guide.instructions.md) | Module topology, configuration/DI wiring, registration, import conventions    |
| [Coding standards](.github/instructions/coding-standards.instructions.md)     | Formatting, naming, file suffixes, TypeScript rules, comments, anti-patterns  |
| [Patterns](.github/instructions/patterns.instructions.md)                     | Copy-paste recipes: modules, controllers, services, DTOs, guards, docs, tests |
| [Code exemplars](exemplars.md)                                                | Pointers to high-quality real examples in this repo                           |
| [README](README.md)                                                           | Human-facing project documentation and setup                                  |

Task-specific prompts (Copilot/VS Code) live in `.github/prompts/`; reusable agent
definitions in `.github/agents/`.
