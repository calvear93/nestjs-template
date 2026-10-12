# Skill: Zod schemas + OpenAPI

Full API: [`src/libs/zod/README.md`](../../src/libs/zod/README.md). Reference code:
`src/app/modules/sample/{schemas,controllers}/`. Scaffolds: `ts-zod-schema`,
`nest-controller-with-service`.

## Schemas (`schemas/<name>.schema.ts`)

```ts
const _UserSchema = z
	.object({ id: z.coerce.number(), email: z.email() })
	.meta({ id: 'User' }); // named OpenAPI component, set BEFORE compile

export const UserSchema = z.compile(_UserSchema); // AOT fast path
export type User = z.infer<typeof UserSchema>;
```

- `.meta()` after `z.compile()` re-clones and drops the fast path. Without an `id`, the schema
  renders inline in OpenAPI.
- Derived schemas (`.omit()`, `.partial()`, …) start from the `_` base and get their own
  `.meta({ id })` + `z.compile()`. When nesting in the same file, embed the `_` base.
- Use Zod 4 top-level formats (`z.email()`, `z.uuid()`, `z.iso.datetime()`, not
  `z.string().email()`). Use `z.coerce.*` for query/param values (they arrive as strings).
- Template validators from `#libs/zod`: `phone()`, `epoch()`. Leave them uncompiled.
- Types come from `z.infer`; never write DTO classes.

## Controllers

- Bind with `@Body({ schema: XSchema })`, `@Query('k', { schema })` and
  `@Param('k', { schema })`. The global `StandardSchemaValidationPipe` (in `app.ts`) validates
  and returns 400 on failure. Never call `.parse()` by hand.
- Controllers only map HTTP to service calls. Throw `NotFoundException` & co. for error paths.

## Docs (`controllers/<name>.controller.docs.ts`)

- Export `XControllerDocs: DecoratorsLookUp<XController>` with `class` (`ApiTags`), `common`
  (shared responses) and `method` (per-method `ApiOperation` / `ApiResponse`).
- Apply it with `@ApplyControllerDocs(XControllerDocs)`. It is a no-op unless `SWAGGER_UI=true`.
- Responses: `ApiResponse({ standardSchema: XSchema, status: HttpStatusCode.OK })`, plus
  `isArray: true` for lists. Status codes come from `HttpStatusCode` (`#libs/http`).
- In `ApiBody`, `schema` is **inert**: Nest overwrites it from `@Body({ schema })`. Only
  `examples` matter there.
