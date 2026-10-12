# Change records

Each **non-trivial** change gets one short Markdown file: the durable record of what changed and
why. Which changes qualify is defined in [ways-of-working §2](../../.ai/skills/ways-of-working.md).
Small and trivial changes need only the commit. Code, tests and `AGENTS.md` describe the current
behavior; these files keep the _why_.

## Rules

- **Name:** `YYYY-MM-DD-<slug>.md` (date opened, kebab-case slug of ≤ 5 words). Never rename or
  move a record.
- **Lifecycle** (`status` in the frontmatter):
    1. `planned`: written before any code, with Goal and Plan.
    2. `in-progress`: tick the plan as you go and append the steps you discover.
    3. One of two endings:
        - `done`: the DoD passed; Decisions and Verification are filled from real results.
        - `dropped`: one line under Goal saying why; keep the file.
- **Short:** aim for under ~60 lines. Link files, don't paste code. A choice with no real
  alternative is not a Decision.
- **Immutable once done:** a later change that revisits it writes a new record naming this one.
- **English.** Commit it with the change; the commit body gets `Refs: docs/changes/<file>.md`.

## Skeleton

```markdown
---
status: planned # planned | in-progress | done | dropped
---

# <Outcome in a few words>

## Goal

<1–3 sentences: what changes for the user, and why.>

## Plan

- [ ] <step; tests first where it applies>

## Decisions

- <decision> · <why> · <alternative rejected>

## Verification

- Gate: <gate from AGENTS.md> → <tests / coverage / lint / build>
- Manual: <what you ran or opened, and what you saw>

## Not included / assumptions

- <out of scope · follow-ups · assumptions for the user to confirm>
```
