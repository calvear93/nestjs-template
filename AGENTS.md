# AGENTS.md

> Single source of truth for **all** AI coding assistants working in this repository
> (GitHub Copilot, Claude, Gemini, Codex, Cursor, and any agent that reads `AGENTS.md`).

This is a modern, production-ready **NestJS + TypeScript API template** running on Fastify.
It emphasizes type safety end-to-end with Zod, a modular feature architecture, NestJS
dependency injection, OpenAPI/Swagger documentation, and comprehensive testing.

## How to use this document

- This file is the canonical, tool-agnostic instruction set. `CLAUDE.md` and `GEMINI.md`
  are thin pointers to it, and GitHub Copilot reads this file natively — **do not**
  duplicate guidance into those pointers.
- Keep this file as the high-level contract (stack, rules, conventions). Long-form
  detail lives in the deep references at the bottom; link to them instead of repeating.
- **Operating manual:** read [`.ai/skills/ways-of-working.md`](.ai/skills/ways-of-working.md) first — the autonomy policy, the Definition of Done, and how to talk to a (possibly non-technical) user.
- User instructions always take precedence — see Priority order below.

## Priority order

When guidance conflicts, resolve in this order:

1. **User instructions** — a direct request in chat.
2. **This file (`AGENTS.md`)** — the canonical, tool-agnostic contract.
3. **Deep references** in [`.github/instructions/`](.github/instructions/) and the canonical
   scaffolds in [`.vscode/__templates__/`](.vscode/__templates__/).
4. **Existing patterns** in the codebase (`src/`, and `docs/` where present).

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
.vscode/__templates__/   canonical code scaffolds for every component type (controller,
                         service, module, provider, guard, interceptor, DTO/schema,
                         exception filter, test, …)
```

Path aliases (`package.json#imports`): `#libs/zod`, `#libs/http`, `#libs/decorators`,
`#testing`. See **architecture-guide** for full module topology and wiring.

When generating any component, start from the matching scaffold in
[`.vscode/__templates__/`](.vscode/__templates__/) — it is the source of truth for file
suffixes, folder layout, and controller/service/module/DTO/test signatures.

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

- Code and documentation are in **English** — identifiers, comments, API names, errors, docs.
- **Domain exception:** preserve business-domain terms in their original language when the user
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

## Spec-driven development (SDD)

Build features through a spec-first loop that follows the **OpenSpec** convention
([openspec.dev](https://openspec.dev)): living specs are the current truth, and each request
is a **change** (like a DB migration) carrying spec **deltas** that get applied on ship.
`AGENTS.md` is the constitution; the procedures live in [`.ai/skills/`](.ai/skills/):

```
/spec-intake    rough idea → an idea brief (optional on-ramp: shape a detailed input)
/spec-propose   idea    → specs/changes/<id>/proposal.md + specs/<cap>/spec.md deltas (what + why)
/spec-design    change  → specs/changes/<id>/design.md   (technical design; skip if trivial)
/spec-tasks     change  → specs/changes/<id>/tasks.md    (atomic, test-first tasks)
/spec-implement change  → code + tests (test → build → fix, Vitest)
/spec-archive   change  → verify + apply deltas to specs/specs/ + move to specs/changes/archive/
```

`/spec-intake` is optional: a guided interview that helps anyone (technical or not) turn a
rough idea into a detailed brief, which `/spec-propose` then formalizes. Skip it when the
request is already clear and complete.

Folder model (root `specs/`): `specs/specs/` = **living truth** (one folder per capability);
`specs/changes/<id>/` = **proposals** with `## ADDED|MODIFIED|REMOVED Requirements` deltas;
`specs/changes/archive/YYYY-MM-DD-<id>/` = shipped changes (the durable decision log). See
[`.ai/skills/spec-conventions.md`](.ai/skills/spec-conventions.md) for the exact format and
[`specs/project.md`](specs/project.md) for project context. The official `openspec` CLI is not
used (it hardcodes an `openspec/` root and can't target `specs/`); the skills are the engine.

`/spec-implement` reuses the canonical task prompts in [`.ai/prompts/`](.ai/prompts/)
(`create-module`, `create-api-endpoint`, `api-documentation`, `error-handling`,
`testing-strategy`) instead of redefining them. GitHub Copilot exposes the loop as `/spec-*`
prompts under `.github/prompts/`; Claude, Gemini, and Codex follow the procedure files
directly. The best-practice skills (`typescript`, `nestjs`, `zod-schema`, `ioc-binding`, `vitest-tdd`,
`vite-config`) live alongside them in [`.ai/skills/`](.ai/skills/).

## Deep references

| Document                                                                      | Scope                                                                               |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [Operating manual](.ai/skills/ways-of-working.md)                             | Autonomy, default technical decisions, Definition of Done, non-technical-user comms |
| [Architecture guide](.github/instructions/architecture-guide.instructions.md) | Module topology, configuration/DI wiring, registration, import conventions          |
| [Coding standards](.github/instructions/coding-standards.instructions.md)     | Formatting, naming, file suffixes, TypeScript rules, comments, anti-patterns        |
| [Patterns](.github/instructions/patterns.instructions.md)                     | Copy-paste recipes: modules, controllers, services, DTOs, guards, docs, tests       |
| [Code exemplars](exemplars.md)                                                | Pointers to high-quality real examples in this repo                                 |
| [`.vscode/__templates__/`](.vscode/__templates__/)                            | Canonical code scaffolds for every component type — the starting point for new code |
| [README](README.md)                                                           | Human-facing project documentation and setup                                        |

Task prompts and agents are canonical in [`.ai/prompts/`](.ai/prompts/) and
[`.ai/agents/`](.ai/agents/). GitHub Copilot surfaces them natively via thin pointers in
`.github/prompts/` and `.github/agents/`; Claude, Gemini, and Codex read the `.ai/` files
directly (see `CLAUDE.md`, `GEMINI.md`, and this file).
