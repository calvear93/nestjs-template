# `.ai/` — Spec-driven AI development layer

Tool-neutral, single canonical home for **all** AI task prompts, agents, the
**spec-driven development (SDD)** workflow, and the reusable best-practice skills. This is
the source of truth for every procedure; each AI tool gets a thin adapter that points here
(same philosophy as [`AGENTS.md`](../AGENTS.md)).

**Start with [`skills/ways-of-working.md`](skills/ways-of-working.md)** — the operating manual
that makes agents autonomous and usable by non-technical people: when to act vs. ask, the
default technical decisions, the single Definition of Done, and how to talk to the user.

## Layout

```
.ai/
  prompts/         canonical task-prompt bodies (the real procedures — edit these)
    api-documentation.md  create-api-endpoint.md  create-module.md  …  (17)
    optimize-documentation.md  update-instructions.md   # stack self-maintenance
  agents/          canonical agent definitions (the real bodies — edit these)
    blueprint.md  debug.md  mentor.md  nest.md
  skills/          canonical skill bodies (the real procedures — edit these)
    ways-of-working.md   # ← operating manual: read first
    spec-intake.md   # optional on-ramp: guided interview to shape any idea into a detailed brief
    spec-propose.md  spec-design.md  spec-tasks.md  spec-implement.md  spec-archive.md
    spec-conventions.md  # OpenSpec format & folder-model reference
    typescript.md  nestjs.md  zod-schema.md  ioc-binding.md  vitest-tdd.md  vite-config.md
  templates/       artifact templates used by the spec skills
    idea.template.md  project.template.md  proposal.template.md  design.template.md
    tasks.template.md  spec.template.md  delta.template.md
specs/             OpenSpec workspace (root)
  project.md       stable project context (read first)
  specs/           living truth — one folder per capability (<capability>/spec.md)
  changes/         active proposals (<change-id>/proposal.md, design.md, tasks.md, specs/ deltas)
    archive/       shipped changes (YYYY-MM-DD-<change-id>/) — the decision log
```

## The spec-driven loop (OpenSpec)

Living specs are the current truth; each request is a **change** (like a DB migration) that
carries spec **deltas** and gets applied on ship. See `skills/spec-conventions.md` for the
exact format.

```
AGENTS.md (constitution) + specs/project.md (context)
  → /spec-intake    rough idea → an idea brief (optional on-ramp: shape a detailed input)
  → /spec-propose   idea    → specs/changes/<id>/proposal.md + specs/<cap>/spec.md deltas (what + why)
  → /spec-design    change  → specs/changes/<id>/design.md   (technical design; skip if trivial)
  → /spec-tasks     change  → specs/changes/<id>/tasks.md    (atomic, test-first tasks)
  → /spec-implement change  → code + tests (test → build → fix, Vitest)
  → /spec-archive   change  → verify + apply deltas to specs/specs/ + move to specs/changes/archive/
```

Every step respects `AGENTS.md` and the deep docs in `.github/instructions/`. The
`spec-implement` step runs the local toolchain (`pnpm test:dev --run` → `pnpm build` →
`pnpm lint`) and reuses the canonical task prompts in `.ai/prompts/` (module / endpoint /
API documentation / error-handling / testing) instead of redefining them. The best-practice
skills (`typescript`, `nestjs`, `zod-schema`, `ioc-binding`, `vitest-tdd`, `vite-config`) ground the
work in the real patterns under `.vscode/__templates__/`. The official `openspec` CLI is not
used (it hardcodes an `openspec/` root and can't target `specs/`); the skills are the
authoritative engine.

## How each tool reaches these files

There is **one** canonical copy of every procedure here. Only GitHub Copilot keeps in-repo
adapter files; the other tools read `.ai/` directly via their root context file. This keeps
the root clean and avoids duplicate command listings.

| Tool           | How it reaches `.ai/`                                                                                                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub Copilot | Native thin pointers under `.github/`: `prompts/spec-*.prompt.md` (spec loop), `prompts/*.prompt.md` (tasks), `agents/*.agent.md`. Invoked as `/spec-propose`, `/create-module`, … |
| Claude Code    | `CLAUDE.md` links here — reads `.ai/` directly: point the agent at `.ai/skills/spec-<step>.md`, `.ai/prompts/<task>.md`, or `.ai/agents/<role>.md`.                                |
| Gemini CLI     | `GEMINI.md` links here — same as Claude.                                                                                                                                           |
| Codex          | `AGENTS.md` links here. For native slash commands: `mkdir -p ~/.codex/prompts && cp .ai/skills/spec-*.md .ai/prompts/*.md ~/.codex/prompts/`.                                      |

## Editing rule

Change a procedure **once** in its canonical home (`.ai/prompts/`, `.ai/agents/`, or
`.ai/skills/`). When you add a new prompt, agent, or skill, add its canonical body here and a
one-line pointer under `.github/` for Copilot — the other tools pick it up automatically
through their root context file.
