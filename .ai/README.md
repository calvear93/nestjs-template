# `.ai/` — Spec-driven AI development layer

Tool-neutral, single canonical home for **all** AI task prompts, agents, the
**spec-driven development (SDD)** workflow, and the reusable best-practice skills. This is
the source of truth for every procedure; each AI tool gets a thin adapter that points here
(same philosophy as [`AGENTS.md`](../AGENTS.md)).

## Layout

```
.ai/
  prompts/         canonical task-prompt bodies (the real procedures — edit these)
    api-documentation.md  api-endpoint-creation.md  module-creation.md  …  (~15)
  agents/          canonical agent definitions (the real bodies — edit these)
    blueprint.md  debugger.md  mentor.md  nest.md
  skills/          canonical skill bodies (the real procedures — edit these)
    sdd-specify.md  sdd-plan.md  sdd-tasks.md  sdd-implement.md  sdd-verify.md
    zod-schema.md  ioc-binding.md  vitest-tdd.md  vite-config.md
  templates/       artifact templates used by the SDD skills
    spec.template.md  plan.template.md  tasks.template.md
specs/             generated artifacts, one folder per feature (NNN-slug/)
```

## The SDD loop

```
AGENTS.md (constitution)
  → /specify   idea        → specs/NNN-slug/spec.md   (what + acceptance criteria)
  → /plan      spec.md      → specs/NNN-slug/plan.md   (technical design)
  → /tasks     plan.md      → specs/NNN-slug/tasks.md  (atomic, test-first tasks)
  → /implement tasks.md     → code + tests (TDD)
  → /verify    code         → lint + tests + coverage vs the spec
```

Every step respects `AGENTS.md` and the deep docs in `.github/instructions/`. The
`implement` step reuses the canonical task prompts in `.ai/prompts/` (module / endpoint /
API documentation / error-handling / testing) instead of redefining them.

## How each tool reaches these files

There is **one** canonical copy of every procedure here. Only GitHub Copilot keeps in-repo
adapter files; the other tools read `.ai/` directly via their root context file. This keeps
the root clean and avoids duplicate command listings.

| Tool           | How it reaches `.ai/`                                                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GitHub Copilot | Native thin pointers under `.github/`: `prompts/spec-*.prompt.md` (SDD), `prompts/*.prompt.md` (tasks), `agents/*.agent.md`. Invoked as `/spec-specify`, `/module-creation`, … |
| Claude Code    | `CLAUDE.md` links here — point the agent at `.ai/skills/sdd-<step>.md`, `.ai/prompts/<task>.md`, or `.ai/agents/<role>.md`.                                                    |
| Gemini CLI     | `GEMINI.md` links here — same as Claude.                                                                                                                                       |
| Codex          | `AGENTS.md` links here. For native slash commands: `mkdir -p ~/.codex/prompts && cp .ai/skills/sdd-*.md .ai/prompts/*.md ~/.codex/prompts/`.                                   |

## Editing rule

Change a procedure **once** in its canonical home (`.ai/prompts/`, `.ai/agents/`, or
`.ai/skills/`). When you add a new prompt, agent, or skill, add its canonical body here and a
one-line pointer under `.github/` for Copilot — the other tools pick it up automatically
through their root context file.
