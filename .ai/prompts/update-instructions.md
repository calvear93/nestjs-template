# Prompt: Update LLM instructions

Keep this template's instruction assets consistent with the current implementation, with a single
clear source-of-truth hierarchy.

## In-scope files

- `AGENTS.md` — the canonical contract
- `llms.txt` — compact entrypoint (only if the template has one)
- `.github/instructions/*.instructions.md`
- `.github/prompts/*.prompt.md` (only the instruction-maintenance ones)
- `CLAUDE.md` / `GEMINI.md` / `.ai/README.md` — thin pointers (keep them thin)

## Objectives

1. Remove contradictions and stale examples (commands, paths, skill/agent/prompt names).
2. Reduce duplicated rules across files.
3. Keep a clear source-of-truth order: user instructions → `AGENTS.md` → `.github/instructions/` +
   `.vscode/__templates__/` → existing source patterns.
4. Align instructions with the real patterns in `src/` and `.vscode/__templates__/`.

## Process

1. Scan and compare the instruction files; read the actual `package.json` scripts and `.ai/`
   contents.
2. Validate every command and name against what exists on disk (no invented scripts, no dangling
   links).
3. Propose a minimal but complete edit set.
4. Apply it with concise wording and stable relative links.
5. Verify: every skill/prompt/agent named in the pointers exists; every link resolves; `pnpm lint`
   is clean.

## Synchronization rules

- Canonical rules and narrative guidance live in `AGENTS.md` (the single source of truth).
- `llms.txt` is a compact entrypoint / navigation index only.
- Thin pointers (`CLAUDE.md`, `GEMINI.md`, `.github/`) never duplicate guidance — they link.
- Do not restate the same policy verbatim in multiple files.

## Output

- What changed and why (per file), plus any remaining follow-ups.
