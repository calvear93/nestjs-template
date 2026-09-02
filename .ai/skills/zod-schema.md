# Skill: Zod schema design (NestJS)

Design type-safe Zod 4 schemas for request/response validation and OpenAPI documentation — no
DTO class wrapper needed.

## When to use

Defining or reviewing any request/response shape, or runtime-validated boundary.

## Guidelines

- Co-locate schemas as `schemas/*.schema.ts`. Define the shape as a private
  `const _XSchema = z.object({...})`, then `export const XSchema = z.compile(_XSchema)` and
  `export type X = z.infer<typeof XSchema>` — no class wrapper.
- **Compile every exported schema** (`z.compile()`, Zod 4.5) — see "AOT compilation" below.
- Add `.meta({ id: 'Name' })` on the `_`-prefixed base, **before** `z.compile()`, to register it
  as a named, reusable OpenAPI component (`components.schemas`) — without an `id` the schema
  always renders inline. Order matters: `.meta()` after `z.compile()` re-clones and drops the
  compiled fast path. See "OpenAPI Integration" in `src/libs/zod/README.md`.
- Attach `.meta({ description })` on fields so Swagger documents them.
- Provide actionable messages: `z.string().min(1, 'Name is required')`.
- Use Zod 4 top-level formats: `z.email()`, `z.uuid()`, `z.iso.date()` (not the deprecated
  `z.string().email()`). Domain validators `phone()` / `epoch()` come from `#libs/zod` — leave
  them **uncompiled**: they are building blocks, and the parent object schema's `z.compile()`
  covers their transforms.
- Coerce external/string inputs at the edge: `z.coerce.number()`, `z.coerce.boolean()`.
- Derive variants instead of redefining: `.omit()` for create, `.partial()` for update,
  `.pick()` for field-level validation. **Derived schemas do not inherit the base schema's
  `id` or its compilation** — give each variant its own `.meta({ id })` (if it needs to
  register as its own component) and its own `z.compile()`.
- The globally registered `StandardSchemaValidationPipe` validates any `@Body`/`@Query`/
  `@Param({ schema })` parameter automatically — no manual `.parse()` in controllers.

## Pattern

```typescript
import { z } from 'zod';

const _UserSchema = z
	.object({
		id: z.coerce.number().meta({ description: 'User id' }),
		name: z.string().min(1, 'Name is required').max(100),
		email: z.email('Invalid email format'),
		isActive: z.boolean().default(true),
	})
	.meta({ id: 'User' });

export const UserSchema = z.compile(_UserSchema);
export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = z.compile(
	_UserSchema.omit({ id: true }).meta({ id: 'CreateUser' }),
);
export type CreateUser = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.compile(
	_UserSchema.partial().meta({ id: 'UpdateUser' }),
);
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
```

Controllers consume the schema directly: `create(@Body({ schema: CreateUserSchema }) user: CreateUser)`.
See `.github/instructions/patterns.instructions.md` → "Schema validation".

## AOT compilation (`z.compile()`, Zod 4.5)

`z.compile(schema)` returns a clone whose validator runs a generated fast path first and falls
back to the runtime parser for anything it can't model. **No API or type change** — the
Standard Schema `~standard` surface (what `StandardSchemaValidationPipe` uses), `z.infer`,
`.omit`/`.partial`, `.refine`/`.transform`, and the OpenAPI output are all identical. Measured
~2–4x faster on valid payloads; the error path is unchanged. When one schema embeds another
**in the same file**, reference the `_`-prefixed base — the parent's single `z.compile()`
covers the whole tree. See `src/libs/zod/README.md` → "`z.compile()` and the OpenAPI document"
for the `allOf` wrapper it produces on a named component's `$ref`, and why.

## Lint notes

Single quotes, inline `type` imports, sorted object members (id-like first). No `any`.
