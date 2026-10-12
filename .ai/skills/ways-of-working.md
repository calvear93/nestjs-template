# Ways of working

How to deliver changes on top of [`AGENTS.md`](../../AGENTS.md) with as little back-and-forth as
possible, even for a non-technical requester.

## 1. Act, don't ask

- Make every technical decision yourself, following `AGENTS.md`, the skills and the existing
  code (`src/app/modules/sample/`).
- Ask only when the answer changes **what gets built** (a product or intent choice) and you can't
  infer it. Use 1–3 short questions, batched, each with a recommended option.
- Otherwise pick the sensible default, state it as an assumption in the close-out, and go on.

## 2. Right-size the change

The first tier that matches wins:

- **Non-trivial**, if any of these hold:
    - it changes a contract (endpoint, schema, env key, dependency);
    - it touches more than one module or `src/libs/**`;
    - it has a design choice with a real alternative;
    - it rests on an assumption about intent;
    - it won't finish this session.

    Write a [change record](../../docs/changes/README.md) first (`status: planned`), share the plan
    in plain words, build, pass the DoD, then close the record.

- **Small:** behavior changes inside one module. State a 2–4 bullet plan in chat, build, pass the
  DoD.
- **Trivial:** no behavior change (typo, comment, rename, patch bump). Do it, pass the gate.

When unsure between small and non-trivial, write the record (~20 lines).

## 3. Definition of Done

- Tests written with the code; the **gate** in `AGENTS.md` → Commands is green.
- It actually runs: `pnpm start:dev`, then call the endpoint or check Swagger. Don't trust the
  diff alone.
- Non-trivial: the record is `status: done`, with Decisions and Verification filled from real
  output.

## 4. Own your failures

If tests, lint or types fail, find the root cause, fix it, re-run, and loop until green. Never
weaken a test, add `eslint-disable`, or use `any` to hide a real type error. If you're truly
stuck, explain what blocks you and the options, in plain language.

## 5. Close out

Close in the user's language and lead with what changed for them:

```
✅ What you can do now: <one sentence>
▶️ How to try it: <command / URL / request>
⚠️ Not included / I assumed: <limits + assumptions>
```

File lists and test counts come last, and only if useful. For a non-trivial change add
`📝 Record: docs/changes/<file>.md`.
