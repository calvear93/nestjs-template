# Skill: SDD — Specify

Turn a feature idea into a written specification. **What and why, never how.**

## When to use

First step of any new feature. Input: a one-line idea or request. Output: a spec file.

## Procedure

1. **Locate/allocate the feature folder.** Find the highest existing `specs/NNN-*`; use the
   next zero-padded number. Slugify the feature name → `specs/NNN-<slug>/`.
2. **Clarify if underspecified.** If scope, users, or success are unclear, ask **up to 3**
   focused questions before writing. Do not invent requirements silently.
3. **Write `specs/NNN-<slug>/spec.md`** from `.ai/templates/spec.template.md`. Fill every
   section. Acceptance criteria MUST be Given/When/Then so they map 1:1 to tests later.
4. **Respect `AGENTS.md`** — especially the language policy (English code; preserve explicit
   business-domain terms) and the "no hardcoded config" rule when describing data/config.
5. **Keep it implementation-free.** No file names, modules, or libraries here — that is
   `/plan`. Capture observable behavior and constraints only.

## Output

- The created spec path and a one-paragraph summary of scope + acceptance criteria count.
- List any unresolved open questions.
- **Next step:** run `/plan` once the spec is approved.
