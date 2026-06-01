# specs/

Spec-driven development artifacts. One folder per feature.

```
specs/
  001-user-management/
    spec.md     what + acceptance criteria   (/specify)
    plan.md     technical design              (/plan)
    tasks.md    atomic, test-first tasks      (/tasks)
  002-...
```

- Folders are numbered `NNN-<slug>` (zero-padded, incrementing).
- The workflow and templates live in [`.ai/`](../.ai/README.md); `AGENTS.md` is the constitution.
- Flow: `/specify` → `/plan` → `/tasks` → `/implement` → `/verify`.

Keep specs in version control: they document intent and provide traceability from
requirements to tests.
