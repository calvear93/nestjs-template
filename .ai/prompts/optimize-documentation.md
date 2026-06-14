# Prompt: Optimize TypeScript documentation (JSDoc/TSDoc)

Audit and tighten the JSDoc/TSDoc comments in this template's TypeScript source so they are
concise, accurate, and consistent — **without changing code behavior**.

## When to use

When `.ts`/`.tsx` doc comments have drifted: verbose prose, stale examples, missing `@param`s, or
inconsistent style across files.

## Inputs (required)

```
Target files: <glob, e.g. src/**/*.ts>
Rules:        <optional; defaults below>
```

If no target is given, ask for it and make no edits.

## Default rules

- **Style:** JSDoc `/** … */` blocks. The first sentence is a one-line summary (imperative,
  capitalized).
- **Keep:** `@param` (name + brief purpose), `@returns`, `@throws` (when the function can throw),
  and any runnable `@example`. Preserve `@example` blocks **verbatim**.
- **Trim:** multi-paragraph prose, type information already expressed in the signature,
  "Notes/Warnings" that don't aid understanding, and redundant restatements.
- **Add when missing:** a one-line summary, `@param` purpose, `@returns`, `@throws`, and an
  `@example` for non-trivial public APIs.
- **Capitalization (house rule):** the main description starts uppercase; `@param`/`@returns`/tag
  text starts lowercase.
- English only. Do not touch logic, types, or formatting outside the comment blocks.

## Process

1. Resolve the target glob; read each file's doc comments.
2. Apply the rules per export (class / function / method / property).
3. Preserve every `@example` block exactly.
4. Run `pnpm lint` (and `tsc --noEmit` where available) to confirm nothing broke.

## Output

- Per edited file: a 2-line note (what changed, why).
- Confirm no type/lint errors, and suggest a commit message
  (`docs(<area>) 📚: tighten JSDoc`).

## Scope

Only edit doc comments in the target `.ts`/`.tsx` files. List anything else as a recommendation.
