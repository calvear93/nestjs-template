# Project: NestJS Template (Fastify)

> OpenSpec project context. This is the stable, high-level description of **this** codebase
> that every spec-driven change reads first. Keep it short and current; deep rules live in
> [`AGENTS.md`](../AGENTS.md) and [`.github/instructions/`](../.github/instructions/).

## Stack

- **Framework / language:** NestJS 11+ on Fastify · TypeScript 5+
- **Architecture:** feature modules (flat layout) — `src/app/modules`, `src/libs`
- **Validation:** Zod 4+ via `#libs/zod` (`ZodDto`, `ZodValidationPipe`)
- **API docs:** OpenAPI / Swagger (colocated `*.controller.docs.ts`)
- **HTTP client:** `#libs/http` for outbound calls; no ORM/database layer in this template
- **Testing:** Vitest + `vitest-mock-extended` (coverage ≥ 80%)
- **Build / runtime:** Vite + vite-node; Node `>=24`, pnpm `>=11`

## Conventions

- Code and docs in **English** (preserve only user-defined business-domain terms). Tabs (width 4),
  single quotes, semicolons, trailing commas; `.ts` extension on relative imports; `#libs/*` /
  `#testing` aliases. Full rules in [`AGENTS.md`](../AGENTS.md).
- The canonical code scaffolds live under [`.vscode/__templates__/`](../.vscode/__templates__/).

## Quality gates (the change lifecycle runs these)

```bash
pnpm lint                        # ESLint (fix, cached)
pnpm build                       # production build (Vite) — type/build errors
pnpm test:dev --coverage --run   # full Vitest suite once, with coverage
pnpm format                      # Prettier (write)
```

## How specs work here (OpenSpec)

- `specs/specs/` — **living truth**: one folder per capability, the behavior that **is** built.
- `specs/changes/` — **proposals** (like DB migrations): each change carries spec **deltas**
  (`## ADDED|MODIFIED|REMOVED Requirements`). When shipped, `spec-archive` applies the deltas
  to `specs/specs/` and moves the change to `specs/changes/archive/`.

See the lifecycle in [`.ai/README.md`](../.ai/README.md) and the format in
[`.ai/skills/spec-conventions.md`](../.ai/skills/spec-conventions.md).
