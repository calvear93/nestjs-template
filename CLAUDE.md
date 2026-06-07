# CLAUDE.md

The full, tool-agnostic instructions for this repository live in **[AGENTS.md](./AGENTS.md)**.

@AGENTS.md

Reusable capabilities live in [`.ai/`](./.ai/README.md) — read the relevant file when it applies:

- `.ai/skills/` — OpenSpec spec-driven workflow (optional `spec-intake` on-ramp → `spec-propose` → `spec-design` → `spec-tasks` → `spec-implement` → `spec-archive`, with `spec-conventions` as the format reference) and best-practice skills (`typescript`, `nestjs`, `zod-schema`, `ioc-binding`, `vitest-tdd`, `vite-config`).
- `.ai/prompts/` — task playbooks (module / endpoint creation, API docs, error handling, testing, reviews, generators).
- `.ai/agents/` — agent roles (`blueprint`, `debugger`, `mentor`, `nest`).

To run the spec-driven loop, follow `.ai/skills/spec-<step>.md` (the change folder lives under
`specs/changes/`; living specs under `specs/specs/`). Do not duplicate guidance here — update
`AGENTS.md` or the `.ai/` files instead.
