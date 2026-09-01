# Skill: NestJS Patterns

How to wire controllers, services, modules, providers and guards in this **Fastify**-based
NestJS template. Start from the scaffolds in [`.vscode/__templates__/`](../../.vscode/__templates__/)
and the copy-paste recipes in
[`patterns.instructions.md`](../../.github/instructions/patterns.instructions.md).

## When to use

Creating or reviewing any NestJS component (module / controller / service / provider / guard /
interceptor / pipe).

## Layout

Feature modules group files by kind under `src/app/modules/<name>/`: `controllers/*.controller.ts`
+ `*.controller.docs.ts` + `*.spec.ts`, `services/*.service.ts` + `*.spec.ts`,
`schemas/*.schema.ts`. Shared code lives in `src/libs/*` behind `#libs/*` aliases.

## Rules

- **Thin controllers, rich services.** Controllers handle HTTP only; business logic lives in
  `@Injectable()` services.
- **Validate at the edge.** Every input goes through `@Body`/`@Query`/`@Param({ schema })` and the
  global `StandardSchemaValidationPipe` — register the schema for OpenAPI with
  `.meta({ id: 'Model' })`. See the `zod-schema` skill.
- **Inject, never hardcode.** Config and dependencies flow through NestJS DI (`useFactory`
  providers); **never** read `process.env` outside `src/app/config/`. See the `ioc-binding` skill.
- **Document every endpoint.** A colocated `*.controller.docs.ts` carries the `@nestjs/swagger`
  decorators (`ApiOperation`, `ApiResponse({ standardSchema })`).
- **Errors.** Throw NestJS HTTP exceptions; always handle the error path. The global filter is
  Fastify-based — use Fastify types/adapter, never Express.
- **Security.** `@ApiKey()` at the controller level; `@AllowAnonymous()` for public endpoints;
  build custom guards with `createSecurityGuard()` from `#libs/decorators`.
- Register feature modules in `app.module.ts`; keep providers minimal (YAGNI).

```typescript
@Controller({ path: 'users', version: '1' })
@ApiKey()
export class UserController {
	constructor(private readonly _users: UserService) {}

	@Post()
	create(@Body({ schema: CreateUserSchema }) dto: CreateUser): Promise<User> {
		return this._users.create(dto);
	}
}
```

> Module / endpoint scaffolding: `.ai/prompts/create-module.md` and
> `.ai/prompts/create-api-endpoint.md`.
