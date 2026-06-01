# Skill: Zod schema & DTO design (NestJS)

Design type-safe Zod 4 schemas and `ZodDto` classes for request/response validation and
OpenAPI documentation.

## When to use

Defining or reviewing any DTO, request/response shape, or runtime-validated boundary.

## Guidelines

- Co-locate schemas as `schemas/*.dto.ts`; expose them as classes via `ZodDto(schema, 'Name')`
  from `#libs/zod` — the second argument names the OpenAPI schema.
- Attach `.meta({ description })` on the object and on fields so Swagger documents them.
- Provide actionable messages: `z.string().min(1, 'Name is required')`.
- Use Zod 4 top-level formats: `z.email()`, `z.uuid()`, `z.iso.date()` (not the deprecated
  `z.string().email()`). Domain validators `phone()` / `epoch()` come from `#libs/zod`.
- Coerce external/string inputs at the edge: `z.coerce.number()`, `z.coerce.boolean()`.
- Derive variants instead of redefining: `.omit()` for create, `.partial()` for update,
  `.pick()` for field-level validation.
- The globally registered `ZodValidationPipe` validates `@Body()` DTOs automatically — no
  manual `.parse()` in controllers.

## Pattern

```typescript
import { ZodDto } from '#libs/zod';
import { z } from 'zod';

const UserSchema = z
	.object({
		id: z.coerce.number().meta({ description: 'User id' }),
		name: z.string().min(1, 'Name is required').max(100),
		email: z.email('Invalid email format'),
		isActive: z.boolean().default(true),
	})
	.meta({ description: 'User DTO schema' });

export class UserDto extends ZodDto(UserSchema, 'User') {}

const CreateUserSchema = UserSchema.omit({ id: true });
export class CreateUserDto extends ZodDto(CreateUserSchema, 'CreateUser') {}

const UpdateUserSchema = UserSchema.partial();
export class UpdateUserDto extends ZodDto(UpdateUserSchema, 'UpdateUser') {}
```

Controllers consume the DTO directly: `dto(@Body() user: CreateUserDto)`. See
`.github/instructions/patterns.instructions.md` → "DTO / schema validation".

## Lint notes

Single quotes, inline `type` imports, sorted object members (id-like first). No `any`.
