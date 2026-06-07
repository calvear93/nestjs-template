# Project: <app name>

> OpenSpec project context. Stable, high-level description of this codebase that every
> spec-driven change reads first. Keep short; deep rules live in `AGENTS.md`.

## Stack

- **Platform / language:** <e.g. NestJS + TypeScript on Fastify>
- **Architecture:** <e.g. feature modules — src/app/modules, src/libs>
- **Validation:** <e.g. Zod (ZodDto) via #libs/zod>
- **Testing:** <e.g. Vitest + vitest-mock-extended>
- **Runtime / tooling:** <e.g. Vite + vite-node + pnpm scripts>

## Conventions

- <Language policy, formatting, where canonical code scaffolds live. Link `AGENTS.md`.>

## Quality gates (the change lifecycle runs these)

```bash
<lint command>
<build command>
<test command>
<format command>
```

## How specs work here (OpenSpec)

- `specs/specs/` — living truth (one folder per capability).
- `specs/changes/` — proposals with spec deltas (ADDED/MODIFIED/REMOVED); archived on ship.
