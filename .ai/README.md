# `.ai/` — skills

This is the tool-neutral home for on-demand guidance. [`AGENTS.md`](../AGENTS.md) is always loaded
and holds the rules. These files carry the detail and are read only when the task needs it. This
file is the **only** catalogue.

| Skill                                          | Read it when                                              |
| ---------------------------------------------- | --------------------------------------------------------- |
| [`ways-of-working`](skills/ways-of-working.md) | Always, before a non-trivial task (process + DoD)         |
| [`zod-openapi`](skills/zod-openapi.md)         | Writing schemas, controllers or `*.controller.docs.ts`    |
| [`config-di`](skills/config-di.md)             | Adding config/env vars, providers, HTTP clients or guards |
| [`testing`](skills/testing.md)                 | Writing or fixing tests                                   |

How each tool gets here:

- **Claude Code / Gemini CLI:** `CLAUDE.md` / `GEMINI.md` import `AGENTS.md`.
- **Codex, Cursor and others:** they read `AGENTS.md` natively.
- **GitHub Copilot:** reads `AGENTS.md`, plus the `applyTo`-scoped pointers in
  `.github/instructions/`.

Editing rule: each fact lives in one place. Library APIs live in `src/libs/*/README.md`, env
details in `env/README.md`, and code shapes in `.vscode/__templates__/`. Link to them instead of
copying. Don't restate anything ESLint/Prettier enforce. When adding a skill, add a row here and a
`.github/instructions/<skill>.instructions.md` pointer.
