# Skill: TypeScript (NestJS template)

The TypeScript conventions this template's ESLint (`typescript-eslint` + `perfectionist` +
`unicorn` + `sonarjs`) and Prettier enforce. These are expectations — fix violations before
code is considered done. Deep rules: **[AGENTS.md](../../AGENTS.md)** → _Code style_.

## When to use

Writing or reviewing any `.ts` / `.cts` / `.mts` in this repository.

## Types

- **Strict everywhere.** `tsconfig` runs `strict: true` — never relax it locally.
- **No `any`.** Use `unknown` + narrowing (type guards, `in`, `instanceof`, discriminated
  unions). Reach for a precise type before a cast; avoid `as` except at trusted boundaries.
- **Explicit public surface.** Annotate exported function params and return types; let
  inference handle locals.
- **Model with the type system:** discriminated unions for variants, `as const` for literals,
  `satisfies` to check a value against a type without widening it.
- **Reuse via utility types** — `Partial` · `Required` · `Pick` · `Omit` · `Record` ·
  `Readonly` · `ReturnType` · `Awaited` — instead of re-declaring shapes; mapped &
  template-literal types for derived shapes.
- Runtime input is validated with **Zod** and the type is **inferred** (`z.infer`) — never
  hand-write a parallel interface for a schema. See the `zod-schema` skill.
- Prefer an `as const` object + union (or a Zod enum) over a TypeScript `enum`.

## Imports & modules

- Order (perfectionist, auto-fixable): external packages → `#`-aliases (`#libs/*`, `#testing`)
  → relative.
- **Type-only imports:** `import type { Foo } from '...'` (kept out of the JS output).
- Relative imports include the **`.ts` extension**; aliases and node_modules do not.
- Named exports over default exports.

## Naming & style (Prettier + ESLint)

- Files `kebab-case`; classes/types/interfaces `PascalCase`; functions/vars `camelCase`;
  module constants `SCREAMING_SNAKE_CASE`; private members prefixed `_`.
- Tabs (width 4), single quotes, semicolons, trailing commas (all), ~80 col.
- Arrow functions with parens around params; `async`/`await` over raw `.then()` chains, always
  handling the error path with proper NestJS HTTP exceptions.

## Anti-patterns (lint-flagged)

- `any`; non-null `!` on untrusted values; `// @ts-ignore` (use `// @ts-expect-error <reason>`).
- Re-declaring a type that already exists (derive it with a utility type).
- Unused vars/params — prefix intentional ones with `_`.

```typescript
import { Injectable } from '@nestjs/common';
import type { CreateUser } from './user.dto.ts';

@Injectable()
export class UserService {
	async findOne(id: number): Promise<User | null> {
		// narrow, don't cast
		const raw: unknown = await this._repo.get(id);
		return isUser(raw) ? raw : null;
	}
}
```
