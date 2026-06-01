# Instructions

These are the **deep-reference documents** for AI assistants and developers. The canonical,
tool-agnostic entry point is [`AGENTS.md`](../../AGENTS.md) at the repository root — start
there. These files hold the long-form detail it links to, each with a single, non-overlapping
scope:

| File                                                                       | Scope                                                                                    |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [`architecture-guide.instructions.md`](architecture-guide.instructions.md) | Module topology, configuration/DI wiring, registration, import conventions               |
| [`coding-standards.instructions.md`](coding-standards.instructions.md)     | Formatting, naming, file suffixes, TypeScript rules, comments, test style, anti-patterns |
| [`patterns.instructions.md`](patterns.instructions.md)                     | Copy-paste recipes: modules, controllers, services, DTOs, guards, docs, tests            |

Each file carries `applyTo` frontmatter so GitHub Copilot can apply it as a path-scoped
instruction; other tools read them as plain documentation linked from `AGENTS.md`.

Related directories:

- [`../prompts/`](../prompts/) — task-specific prompts (module/endpoint creation, docs, reviews).
- [`../agents/`](../agents/) — reusable agent/chat-mode definitions.

GitHub Copilot reads `AGENTS.md` natively; Claude, Gemini, and Codex reach it via their root context files.
