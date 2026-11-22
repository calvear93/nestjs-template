---
status: done
---

# One home per rule in the AI layer

## Goal

Several rules of the AI layer were written in two files, a few restated what ESLint already
enforces, and the README contradicted the code on where `process.env` is read. Each rule now lives
in one file and the rest link to it, so `AGENTS.md` (always loaded) is shorter and nothing drifts.
Same pass as the React template's record of the same name.

## Plan

- [x] One home each: how config is read (module-level constant or DI) → `config-di`, linked from
      `AGENTS.md`; how an input is bound (decorator, no DTO, no manual `.parse()`) → `zod-openapi`,
      linked from `AGENTS.md`; thin controllers and HTTP exceptions → `AGENTS.md` → Rules, linked
      from `zod-openapi`; the coverage target → `testing`; "never get past a failure" →
      `ways-of-working` §3, linked from `AGENTS.md` → Types and §4; the reference implementation →
      `AGENTS.md` → Layout
- [x] Lint-owned rules removed: `process.env` only at module level, `test()` over `it()`, no
      `@nestjs/config` and no Express, `any` as a warning; the one list of what lint owns is
      `AGENTS.md` → Rules → Style is tooling-owned, named by `.ai/README.md`
- [x] Facts: README said `process.env` is read only in bootstrap code, while `api-key.guard.ts`
      reads it at module level as `config-di` says; the coverage target is not a threshold
      (`vitest.config.ts` has none); README's skills row names `ways-of-working`
- [x] Shared bodies: `ways-of-working` §3 says what gaming the gate is (a sleep added to the
      list); `docs/changes/README.md`: a project starts its own history, and the gate line asks for
      the result of each step
- [x] `.github/instructions`: already one pointer form, unchanged

## Decisions

- Coverage stays a target, said as one · adding thresholds to `vitest.config.ts` changes the gate,
  outside a docs pass · keeping "≥ 80% coverage" next to a gate that never fails on it

## Verification

- Every relative link of `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `README.md`, `.ai/**`,
  `.github/**` and `docs/changes/README.md` resolves: 42 checked, none broken.
- `prettier --check` on the touched files: clean.
- Facts checked against the code: `PORT` 4004 and `BASE_URL` `api` (`env/appsettings.json`,
  `src/main.ts`); `no-restricted-syntax` for `process.env` inside functions and class properties,
  `no-restricted-imports` for `express`, `@nestjs/platform-express`, `@nestjs/config` and
  `../libs/`, `vitest/consistent-test-it` (`eslint.config.js`); `test:bench` in `package.json`;
  `mockEnv` / `createFastifyApplication` exported by `#testing`.

## Not included / assumptions

- No rule was dropped: each one was moved, deduplicated or corrected.
