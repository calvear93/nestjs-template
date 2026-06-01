# GEMINI.md

The full, tool-agnostic instructions for this repository live in **[AGENTS.md](./AGENTS.md)**.
Read it first and treat it as the single source of truth.

Reusable capabilities live in [`.ai/`](./.ai/README.md) — read the relevant file when it applies:

- `.ai/skills/` — spec-driven workflow (`sdd-specify` → `plan` → `tasks` → `implement` → `verify`) and best-practice skills (`zod-schema`, `ioc-binding`, `vitest-tdd`, `vite-config`).
- `.ai/prompts/` — task playbooks (module / endpoint creation, API docs, error handling, testing, reviews, generators).
- `.ai/agents/` — agent roles (`blueprint`, `debugger`, `mentor`, `nest`).

To run the spec-driven loop, follow `.ai/skills/sdd-<step>.md`. Do not duplicate guidance
here — update `AGENTS.md` or the `.ai/` files instead.
