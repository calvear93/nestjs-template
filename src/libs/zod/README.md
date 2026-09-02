# 🧩 `#libs/zod` — Zod ↔ NestJS

> Turn a [Zod](https://zod.dev) schema into request/response validation **and** OpenAPI documentation — one schema, one source of truth.

This library wires Zod into NestJS's **native Standard Schema support** (v12+): request/response validation via `@Body`/`@Query`/`@Param({ schema })` + the built-in `StandardSchemaValidationPipe`, OpenAPI generation via `zod-openapi`, plus domain validators NestJS doesn't cover natively.

## ✨ Highlights

- **No DTO classes** — a schema is the request type, the response type, and the OpenAPI shape.
- **Native validation** — `@Body`/`@Query`/`@Param({ schema })` + the global `StandardSchemaValidationPipe`.
- **OpenAPI/Swagger** — schemas double as the request/response documentation via `zod-openapi`.
- **Domain validators** — `phone()` and `epoch()` (Unix / .NET dates → `Date`), ready to compose.
- **Type Safety** — full TypeScript typing via `z.infer<>`.

## 🚀 Quick start

### Define a schema

```typescript
// user.schema.ts
import { z } from 'zod';

const _UserSchema = z
	.object({
		id: z.number().positive(),
		name: z.string().min(1).max(100),
		email: z.email(),
	})
	// `.meta({ id })` on the `_`-prefixed base, BEFORE `z.compile()`: registers
	// this as a named, reusable OpenAPI component. Order matters — `.meta()`
	// after `z.compile()` re-clones and drops the fast path. Without an `id`
	// the schema always renders inline and never appears under the document's
	// `components.schemas` — see "OpenAPI Integration" below
	.meta({ id: 'User' });

// `z.compile()` (Zod 4.5): an AOT fast validation path with automatic fallback
// to the runtime parser — same API, same inferred type
export const UserSchema = z.compile(_UserSchema);

export type User = z.infer<typeof UserSchema>;
```

> **Compile every exported schema.** Define the shape as a private `_XSchema`
> (`z.object({...}).meta({ id })` for a named component), export
> `XSchema = z.compile(_XSchema)`. Derived variants (`.omit()`/`.partial()`) are not compiled by
> inheritance — wrap them too: `export const CreateUserSchema = z.compile(_UserSchema.omit({ id: true }))`.
> The domain validators (`phone()`/`epoch()`) stay **uncompiled** — they are building blocks
> whose transforms the parent's `z.compile()` covers.

### Use in a controller

```typescript
// user.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { type User, UserSchema } from './user.schema.ts';

@Controller('users')
export class UserController {
	@Post()
	@ApiOperation({ summary: 'Create a new user' })
	create(@Body({ schema: UserSchema }) userData: User) {
		// userData is validated and typed — no manual .parse() needed
		return { message: `Created ${userData.name}` };
	}
}
```

## 🔍 Validation

The global `StandardSchemaValidationPipe` (registered once in `src/app/app.ts`'s `start()`) validates any parameter decorated with a `schema` option — `@Body({ schema })`, `@Query({ schema })`, `@Param({ schema })`:

```typescript
import { StandardSchemaValidationPipe } from '@nestjs/common';

app.useGlobalPipes(new StandardSchemaValidationPipe());
```

On failure, the pipe throws a `BadRequestException` whose `message` is an array of `"field.path: error message"` strings — no custom exception needed.

## 🧰 Built-in validators

```typescript
import { z } from 'zod';
import { epoch, phone } from '#libs/zod';

const ContactSchema = z.object({
	// strips spaces, validates international / US formats
	phone: phone(), //             "+56 9 9264 1781" → "+56992641781"

	// string timestamp → Date
	createdAt: epoch(), //         milliseconds: "1753134591000" → Date
	bornAt: epoch({ seconds: true }), // seconds: "1753134591" → Date
});
```

`epoch()` also accepts the .NET `"/Date(1753134591)/"` shape.

## 📚 OpenAPI Integration

### Wiring the converter

```typescript
// app.ts
import { standardSchemaConverter } from '#libs/zod';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder().setTitle('API Documentation').build();

const document = SwaggerModule.createDocument(app, config, {
	standardSchemaConverter,
});

SwaggerModule.setup('api/docs', app, document);
```

Once wired, every `@Body`/`@Query`/`@Param({ schema })` on a route is picked up automatically and turned into the **request** body/parameter schema in the generated document — registered as a named `components.schemas` entry whenever the schema carries an `id` (from `.meta({ id })` on the `_`-prefixed base, before `z.compile()`) — no per-route registration needed, and no manual schema in `ApiBody` does anything (see below).

### Documenting responses in `*.controller.docs.ts`

Request-side registration is automatic (previous section), but **responses** have no equivalent route-parameter decorator to piggyback on — use `ApiResponse`'s `standardSchema` option, passing the raw Zod schema directly:

```typescript
import { ApiResponse } from '@nestjs/swagger';
import { UserSchema } from './user.schema.ts';

ApiResponse({
	standardSchema: UserSchema,
	status: 200,
});
```

This is the **only** correct way to register a response schema. Do not compute a `schema:` value by hand (e.g. calling `zod-openapi`'s `createSchema()` yourself) — that runs at decorator-application time, before `SwaggerModule.createDocument()` builds the document, so there is no live `components.schemas` map to register into; any `$ref` it produces would point at a component that was never created. `standardSchema` defers the conversion until the document actually gets built, which is what makes registration work.

### `ApiBody`'s `schema:` field is inert

`ApiBody` has no `standardSchema` option. When a route uses `@Body({ schema })` (this template's convention on every body-validated endpoint), NestJS **always overwrites** whatever `schema:` you pass to `ApiBody` with the properly-registered schema derived from that `@Body()` parameter — the value you supply is discarded. You still have to pass _something_ to satisfy `ApiBody`'s TypeScript signature when attaching `examples` (its type requires `schema` alongside `examples`), so use a trivial placeholder:

```typescript
import { ApiBody } from '@nestjs/swagger';

ApiBody({
	schema: { type: 'object' }, // inert — overwritten automatically, see above
	examples: { admin: { value: { id: 1, name: 'Admin', email: 'a@b.cl' } } },
});
```

`examples:` itself is **not** discarded — it merges into the final document as declared.

### Same schema, both request and response

Referencing the same `.meta({ id })` schema for both a request and a response works, but note how the registration actually happens: NestJS calls `standardSchemaConverter` **once per context** (`input` for the `@Body`-derived request schema, `output` for the `ApiResponse({ standardSchema })`-derived response schema), and each call is an independent `createSchema()` invocation with its own private component registry — there's no batching across calls. Both calls still register under the **same** component name, so whichever call runs later wins (last write into the shared `components.schemas` NestJS builds up across the whole document). `zod-openapi`'s own `outputId`/`outputIdSuffix` auto-renaming does **not** help here — that mechanism only fires when `zod-openapi` itself batches an input+output pair through one `createDocument()`/`createSchemas()` call, which this app doesn't do (verified in `openapi.spec.ts`). If a schema's request and response shapes genuinely need separate documented components, give them different `id`s outright — two `_`-prefixed bases (e.g. `.meta({ id: 'User' })` for the request, `.meta({ id: 'UserResponse' })` on a derived/omitted variant for the response), each wrapped in its own `z.compile()`.

## 📖 API Reference

### `standardSchemaConverter`

The `SwaggerDocumentOptions['standardSchemaConverter']` implementation — pass it to `SwaggerModule.createDocument(app, config, { standardSchemaConverter })` once, in the app bootstrap. Also carries a small internal type-override table (not exported — see "Known gaps" below).

### `epoch(options?)`

Validator for Unix timestamps that converts to `Date`.

**Parameters:**

- `options.seconds?: boolean` — if true, treats timestamp as seconds (default: `false`)

### `phone()`

Validator for international phone numbers.

## 🧪 Testing

Schemas are plain Zod values — exercise them directly, no Nest context required:

```typescript
import { UserSchema } from './user.schema.ts';

test('rejects an invalid email', () => {
	const result = UserSchema.safeParse({ id: 1, name: 'Ada', email: 'nope' });
	expect(result.success).toBe(false);
});
```

## ⚠️ Known gaps vs. the old `json-schema-customizations.ts`

Zod 4's native `toJSONSchema()` (which `zod-openapi` wraps) treats several Zod types as "unrepresentable": `z.void()`, `z.nan()`, `z.symbol()`, `z.map()`, `z.set()`. Left unhandled, using one of these in a schema throws an `Error` at `SwaggerModule.createDocument()` time (not just an imprecise render) — the previous `ZodDto`-based system's manual override table avoided this. `standardSchemaConverter` restores the same representations via a small internal `override` function (see `src/libs/zod/openapi.spec.ts` for exact shapes), so this template's own code doesn't need to do anything — this section is for anyone extending the override table itself. `z.date()` is representable but, without the override, renders as a bare `{ type: 'string' }`; the override adds back `format: 'date-time'`.

`z.map()`/`z.set()` go further than the old table: their value type is recursively converted into a real `additionalProperties`/`items` sub-schema (`z.set()` also gets `uniqueItems: true`) instead of a bare `{ type: 'object' }`/`{ type: 'array' }` stub — the old table's equivalent read `def.valueType.def`, one level too deep, and produced a raw internal Zod definition instead of a schema. One limitation remains: that nested conversion isn't `$ref`-aware, since named-component registration only happens through Zod's internal registry plumbing, which isn't reachable from this `override` hook — so a value type with its own `.meta({ id })` still gets inlined rather than extracted into its own component. Map keys are assumed string-like, per JSON Schema/OpenAPI 3.0 (there's no "key schema" field in the spec).

`z.custom()`/`z.function()` (and some dynamic `z.catch()` fallback values) have no generic JSON shape and would otherwise throw the same way — `standardSchemaConverter` allowlists them via `zod-openapi`'s `allowEmptySchema` option, so they render as an open `{}` schema instead of crashing the whole document. Give one of these its own `.meta()` if you need a precise shape documented.

Everything else the old system customized (`bigint`, `.regex()` string formats, `tuple`, `.nullable()`/`.optional()`, `never`) either matches the old behavior exactly or Zod 4/`zod-openapi` already handle it natively — no override needed.

## `z.compile()` and the OpenAPI document

Exported schemas are `z.compile()` clones of a `_`-prefixed base (see "Quick start"). For a
named component the base carries `.meta({ id })` **before** `z.compile()`:

- **`_X = z.object({...}).meta({ id })`, then `z.compile(_X)`** — the canonical form. Keeps the
  compiled fast path, registers the component, and the child schemas (validator `.meta({...})`
  annotations, the override table, `allowEmptySchema`) all work unchanged since children are
  shared by reference. `zod-openapi` emits the reference site as `{ allOf: [{ $ref }] }` rather
  than a bare `{ $ref }` — a single-element `allOf` is valid OpenAPI 3.0, semantically identical,
  renders the same in Swagger UI / Redoc, and is collapsed by common client generators.
- **`z.compile(_X).meta({ id })`** (id _after_ compile) — **does not work**: `.meta()` returns a
  fresh clone that drops the compiled fast path, so the schema is back to runtime speed (Swagger
  is fine, but the `z.compile()` is a no-op).
- **`z.compile(_X).register(z.globalRegistry, { id })`** — alternative if a _bare_ `$ref` is
  required (some strict codegen). Keeps the fast path and registers in place, at the cost of a
  low-level call in every schema file. Not the default here.

---

**Note:** This library is specifically designed for NestJS 12+ projects with TypeScript. For more information about Zod, check the [official documentation](https://zod.dev/); for `zod-openapi`, see its [README](https://github.com/samchungy/zod-openapi).
