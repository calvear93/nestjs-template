# Skill: Zod schema design (NestJS)

Design type-safe Zod 4 schemas for request/response validation and OpenAPI documentation — no
DTO class wrapper needed.

## When to use

Defining or reviewing any request/response shape, or runtime-validated boundary.

## Guidelines

- Co-locate schemas as `schemas/*.schema.ts`; export the schema and its inferred type directly —
  no class wrapper.
- Add `.meta({ id: 'Name' })` on the object to register it as a named, reusable OpenAPI component
  (`components.schemas`) — without an `id` the schema always renders inline. See "OpenAPI
  Integration" in `src/libs/zod/README.md`.
- Attach `.meta({ description })` on fields so Swagger documents them.
- Provide actionable messages: `z.string().min(1, 'Name is required')`.
- Use Zod 4 top-level formats: `z.email()`, `z.uuid()`, `z.iso.date()` (not the deprecated
  `z.string().email()`). Domain validators `phone()` / `epoch()` come from `#libs/zod`.
- Coerce external/string inputs at the edge: `z.coerce.number()`, `z.coerce.boolean()`.
- Derive variants instead of redefining: `.omit()` for create, `.partial()` for update,
  `.pick()` for field-level validation. **Derived schemas do not inherit the base schema's
  `id`** — give each variant its own `.meta({ id })` if it needs to register as its own
  component.
- The globally registered `StandardSchemaValidationPipe` validates any `@Body`/`@Query`/
  `@Param({ schema })` parameter automatically — no manual `.parse()` in controllers.

## Pattern

```typescript
import { z } from 'zod';

export const UserSchema = z
	.object({
		id: z.coerce.number().meta({ description: 'User id' }),
		name: z.string().min(1, 'Name is required').max(100),
		email: z.email('Invalid email format'),
		isActive: z.boolean().default(true),
	})
	.meta({ id: 'User' });

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({ id: true }).meta({
	id: 'CreateUser',
});

export type CreateUser = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = UserSchema.partial().meta({
	id: 'UpdateUser',
});

export type UpdateUser = z.infer<typeof UpdateUserSchema>;
```

Controllers consume the schema directly: `create(@Body({ schema: CreateUserSchema }) user: CreateUser)`.
See `.github/instructions/patterns.instructions.md` → "Schema validation".

## Lint notes

Single quotes, inline `type` imports, sorted object members (id-like first). No `any`.
