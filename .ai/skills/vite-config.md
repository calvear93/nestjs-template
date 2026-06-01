# Skill: Vite & environment config (NestJS)

Work with the Vite build/dev tooling and environment loading the way this template is set up.

## When to use

Touching `vite.config.ts`, env handling, build modes, aliases, or plugins.

## Build & dev tooling

- This NestJS app builds and runs through Vite: `vite-node` (with `--watch`) for the dev
  server and `vite build` for the production bundle (see `package.json` scripts).
- `vitest.config.ts` holds test config (coverage V8); keep test concerns out of
  `vite.config.ts`.

## Environment loading (`@calvear/env`)

- Scripts load env via `@calvear/env` before running the app (see `package.json` scripts:
  `env -e <env> -m <mode> : ...`). Environments here are `dev` and `release` (extendable).
- Non-secret values live in `env/appsettings.json`; secrets in `env/<env>.env.json`. After
  adding a variable, run `pnpm env:schema` to regenerate the JSON schema.
- Read environment values **only** in the `src/app/config/` Zod layer, then expose them
  through NestJS DI (`useFactory` providers — see `ioc-binding` skill). Never read
  `process.env` scattered across services/controllers.

## Aliases

- Path aliases come from `package.json#imports` (`#libs/zod`, `#libs/http`,
  `#libs/decorators`, `#testing`) — prefer adding new shared libs there over deep relative
  paths.

## Lint notes

Config files follow the same ESLint contract (single quotes, inline `type` imports,
`node:` protocol for Node builtins, sorted imports). Validate env shape with Zod in the
config layer, not ad-hoc `process.env` reads.
