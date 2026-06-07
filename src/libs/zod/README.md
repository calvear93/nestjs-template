# 🧩 `#libs/zod` — Zod ↔ NestJS

> Turn a [Zod](https://zod.dev) schema into a NestJS **DTO** that validates at the edge **and** documents itself in OpenAPI — one schema, one source of truth.

Define the shape once with Zod; `ZodDto` gives you a class you can type `@Body()` with, a pipe that validates incoming payloads, and a JSON Schema for Swagger. No duplicated class-validator decorators.

## ✨ Highlights

- **One schema, three jobs** — runtime validation, static TS types, and OpenAPI schema from a single Zod definition.
- **Drop-in DTOs** — `ZodDto(schema)` returns a class; type params with it and let `ZodValidationPipe` validate.
- **Named OpenAPI schemas** — pass a name to get reusable `$ref` components in the Swagger doc.
- **Iterables too** — `ZodIterableDto` for array / set / tuple bodies.
- **Domain validators** — `phone()` and `epoch()` (Unix / .NET dates → `Date`), ready to compose.

## 📦 API at a glance

| Export                      | Signature                     | Use it to…                                        |
| --------------------------- | ----------------------------- | ------------------------------------------------- |
| `ZodDto`                    | `(schema, name?) => DtoClass` | build a DTO from an object/map/record schema      |
| `ZodIterableDto`            | `(schema, name?) => DtoClass` | build a DTO from an array/set/tuple schema        |
| `ZodValidationPipe`         | `PipeTransform`               | validate any `ZodDto`-typed argument              |
| `registerDtoOpenApiSchemas` | `(openApiDoc) => openApiDoc`  | publish named DTO schemas into Swagger components |
| `isZodDto`                  | `(x) => x is ZodTypeDto`      | detect a DTO class (has a static `schema`)        |
| `phone` / `epoch`           | Zod validators                | validate phone numbers / convert timestamps       |

**A `ZodDto` class exposes**

| Member                | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| `new Dto(input)`      | parses `input` (throws on invalid) and assigns the result  |
| `Dto.safeFrom(input)` | `{ success: true, data } \| { success: false, error }`     |
| `Dto.jsonSchema`      | OpenAPI `SchemaObject` (use in `@ApiBody`, `@ApiResponse`) |
| `Dto.schema`          | the original Zod schema                                    |

## 🚀 Quick start

**1. Enable the pipe globally** (validate every `ZodDto` argument):

```typescript
// main.ts
import { ZodValidationPipe } from '#libs/zod';

const app = await NestFactory.create(AppModule);
app.useGlobalPipes(new ZodValidationPipe());
```

**2. Define a schema and a DTO:**

```typescript
// users/user.dto.ts
import { z } from 'zod';
import { ZodDto } from '#libs/zod';

const UserSchema = z.object({
	id: z.number().positive(),
	name: z.string().min(1),
	email: z.email(),
});

export class UserDto extends ZodDto(UserSchema, 'User') {}
```

**3. Use it in a controller** — the body is validated and typed:

```typescript
import { Body, Controller, Post } from '@nestjs/common';
import { UserDto } from './user.dto.ts';

@Controller('users')
export class UserController {
	@Post()
	create(@Body() user: UserDto) {
		// `user` is parsed, typed, and guaranteed valid here
		return { message: `Created ${user.name}` };
	}
}
```

Invalid payloads are rejected before your handler runs (a `ZodSchemaException` carrying the Zod issues).

## 📚 OpenAPI / Swagger

`ZodDto(schema, 'User')` records the schema under the name `User`. Reference it in decorators via `.jsonSchema`, and publish all named schemas into the document so they appear as reusable components:

```typescript
// main.ts
import { registerDtoOpenApiSchemas } from '#libs/zod';

const document = SwaggerModule.createDocument(app, config);
registerDtoOpenApiSchemas(document); // adds every named DTO to components.schemas
SwaggerModule.setup('docs', app, document);
```

```typescript
@Post()
@ApiBody({ schema: UserDto.jsonSchema })
@ApiOkResponse({ schema: UserDto.jsonSchema })
create(@Body() user: UserDto) { /* … */ }
```

## 🔢 Iterable DTOs

For endpoints that take or return a collection:

```typescript
import { z } from 'zod';
import { ZodIterableDto } from '#libs/zod';

const IdsSchema = z.array(z.number().positive());
export class IdsDto extends ZodIterableDto(IdsSchema, 'Ids') {}

const ids = new IdsDto([1, 2, 3]);
ids.length; // 3 — it really is an array
```

## 🧰 Built-in validators

```typescript
import { z } from 'zod';
import { phone, epoch } from '#libs/zod';

const ContactSchema = z.object({
	// strips spaces, validates international / US formats
	phone: phone(), //                "+56 9 9264 1781" → "+56992641781"
	phoneAlt: phone().optional(),

	// string timestamp → Date
	createdAt: epoch(), //            milliseconds: "1753134591000" → Date
	bornAt: epoch({ seconds: true }), // seconds:      "1753134591"    → Date
});
```

`epoch()` also accepts the .NET `"/Date(1753134591)/"` shape. Both validators ship OpenAPI metadata (`format`, `examples`, `pattern`) so the generated schema stays accurate.

## 🍳 Recipes

### Validate without throwing

```typescript
const result = UserDto.safeFrom(payload);
if (!result.success) return reportIssues(result.error.issues);
useUser(result.data);
```

### Scope the pipe instead of going global

```typescript
import { UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '#libs/zod';

@UsePipes(ZodValidationPipe) // on a controller or a single handler
```

## 🧪 Testing

DTOs are plain classes — exercise the schema directly, no Nest context required:

```typescript
import { UserDto } from './user.dto.ts';

it('rejects an invalid email', () => {
	const result = UserDto.safeFrom({ id: 1, name: 'Ada', email: 'nope' });
	expect(result.success).toBe(false);
});

it('parses a valid payload', () => {
	const user = new UserDto({ id: 1, name: 'Ada', email: 'ada@dev.io' });
	expect(user.name).toBe('Ada');
});
```

## 🧠 How it works

`ZodDto(schema, name?)` returns an anonymous class whose constructor runs `schema.parse(input)` and whose static `safeFrom` runs `schema.safeParse`. The static `jsonSchema` is produced by `z.toJSONSchema` with project-specific overrides (dates → `date-time`, maps/sets/tuples, regex patterns, …) and, when a `name` is given, cached in a module-level registry. `ZodValidationPipe` checks each argument's `metatype` with `isZodDto` (a DTO has a static `schema`); matches are validated via `safeFrom` and rejected with `ZodSchemaException` on failure, while everything else passes through untouched. `registerDtoOpenApiSchemas` flushes the registry into the Swagger document's `components.schemas`.
