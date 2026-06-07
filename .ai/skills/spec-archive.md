# Skill: Spec — Archive

Verify the change against its spec and quality gates, then **apply the deltas to the living
specs and archive the change**. This is the "apply the migration" step — the piece that makes
`specs/specs/` the durable, current truth.

## When to use

After `/spec-implement`, when all tasks are checked. Input: the change folder
`specs/changes/<change-id>/` (proposal, deltas, tasks). Read `spec-conventions` first.

## Procedure

### 1. Verify (quality gate — NestJS + TypeScript)

```bash
pnpm lint                        # ESLint (fix, cached)
pnpm format                      # Prettier (write)
pnpm build                       # production build (Vite) — type/build errors
pnpm test:dev --coverage --run   # full Vitest suite once, with coverage (≥ 80% on touched code)
```

All must pass: **clean build/typecheck**, all Vitest tests green, lint and formatter clean,
coverage on touched code ≥ 80%. Report real output — do not claim green without running.
(Porting to another stack: swap only these commands for the repo's build/test/format loop.)

### 2. Trace deltas → tests

For each requirement/scenario in the change deltas, confirm a passing Vitest test (`*.spec.ts`)
exercises it (use the traceability table in `tasks.md`). Flag any uncovered requirement; if gaps
exist, loop back to `/spec-tasks` or `/spec-implement` — do not archive.

### 3. Spot-check best practices

(`zod-schema`, `ioc-binding`, `nestjs`, `vitest-tdd` skills): controllers thin with business
logic in services; config injected via providers (no hardcoded values, no `process.env` outside
`src/app/config/`); inputs validated through `ZodDto`;
errors thrown as NestJS HTTP exceptions; `@ApiKey()`/`@AllowAnonymous()` applied correctly; no
`any` left where a real type fits; meaningful assertions (would fail if the logic broke).

### 4. Apply the deltas to the living specs

For each `specs/changes/<change-id>/specs/<capability>/spec.md`, update
`specs/specs/<capability>/spec.md`:

- **ADDED Requirements** → if the capability spec doesn't exist, create it from
  `.ai/templates/spec.template.md` (fill `## Purpose`); then insert each `### Requirement:`
  block (with its scenarios) into `## Requirements`. Error if a same-named requirement already
  exists.
- **MODIFIED Requirements** → find the `### Requirement:` whose name matches **exactly** and
  replace its whole block (heading through its last scenario) with the new body. Drop the
  `(Previously: …)` line — it documented the change, not the new truth. Error if not found.
- **REMOVED Requirements** → delete the matching `### Requirement:` block. If a capability ends
  up with zero requirements, delete its `spec.md` (and empty folder).

Keep living specs **clean of delta markers** — no `## ADDED/MODIFIED/REMOVED`, no
`(Previously:)`/`(Reason:)` lines. They read as plain current truth.

### 5. Archive the change

```bash
TODAY=$(date +%F)                       # YYYY-MM-DD
git mv specs/changes/<change-id> specs/changes/archive/$TODAY-<change-id>
```

(Use `git mv` so history follows; plain `mv` if not yet tracked.) Set `proposal.md` status to
`archived`. The archived folder is the permanent record of why and how the change was made.

### 6. Re-validate

Confirm the touched living specs are well-formed per `spec-conventions` (every requirement has
≥ 1 scenario, no leftover delta markers) and `pnpm format` is still clean.

> No CLI: the official `openspec` CLI is not used (it hardcodes an `openspec/` root and can't
> target `specs/`). Steps 4–5 above are done by hand — they are the authoritative procedure.

## Output

- Pass/fail per gate with the actual command output (lint, build, `pnpm test:dev`, format).
- A requirement-by-requirement coverage table (covered / missing).
- The list of living specs created/modified/removed and the archived change path.
- Any follow-ups or deferred items.
