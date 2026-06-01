---
applyTo: 'src/**/*'
description: 'Module topology, configuration/DI wiring, registration and import conventions'
---

# Architecture Guide

Deep reference for **where code lives and how it is wired**. For the high-level rules see
[AGENTS.md](../../AGENTS.md); for code style see [coding-standards](coding-standards.instructions.md);
for copy-paste recipes see [patterns](patterns.instructions.md). This document does not repeat those.

## Top-level layout

```
src/
  app/
    app.module.ts         root module that imports feature modules
    app.ts                application bootstrap
    config/               configuration layer (the only place reading process.env)
    decorators/           app-level decorators (ApiKey, AllowAnonymous, ApplyControllerDocs)
    modules/              feature modules + modules/index.ts barrel
  libs/                   reusable libraries, each with its own README + public index.ts
    zod/                  #libs/zod
    http/                 #libs/http
    decorators/           #libs/decorators
env/                      appsettings.json (non-secret) + <env>.env.json (secrets)
```

## Module structure pattern

Each feature module lives under `src/app/modules/{module-name}/`:

```
controllers/
  {module-name}.controller.ts        endpoints (thin)
  {module-name}.controller.docs.ts   OpenAPI/Swagger documentation
  {module-name}.controller.spec.ts   controller tests
services/
  {module-name}.service.ts           business logic
  {module-name}.service.spec.ts      service tests
schemas/
  {module-name}.dto.ts               Zod schemas + ZodDto classes
interfaces/                          optional TypeScript interfaces
index.ts                             barrel exports
{module-name}.module.ts              NestJS module definition
```

## Library structure pattern

```
src/libs/{library-name}/
  index.ts                  public API (barrel export)
  README.md                 library documentation
  {feature}.ts              core implementation
  exceptions/ | errors/     custom errors
  decorators/               custom decorators (if applicable)
  types/                    type definitions
  __mocks__/                test mocks
  {library-name}.spec.ts    unit tests
```

## Configuration architecture

The **only** place allowed to read `process.env` is the config layer (`src/app/config/`).
Parse and validate with Zod, then expose the result through a NestJS provider:

```typescript
// src/app/config/feature.config.ts
import { z } from 'zod';

const FeatureConfigSchema = z.object({
	apiUrl: z.string().url(),
	timeout: z.coerce.number().default(10000),
});

export type FeatureConfig = z.infer<typeof FeatureConfigSchema>;

export const featureConfig = (): FeatureConfig =>
	FeatureConfigSchema.parse({
		apiUrl: process.env.FEATURE_API_URL,
		timeout: process.env.FEATURE_TIMEOUT,
	});
```

Inject it via a `useFactory` provider (define configuration as far out as possible — at the
module level — and consume it through constructor injection):

```typescript
@Module({
	providers: [
		{ provide: 'FEATURE_CONFIG', useFactory: featureConfig },
		FeatureService,
	],
	exports: ['FEATURE_CONFIG', FeatureService],
})
export class FeatureModule {}
```

Environment files live under `env/`: non-secret values in `appsettings.json`, secrets in
`<env>.env.json`. After changing variables run `pnpm env:schema`.

## Module registration

Export modules from the barrel, then import them in the root module:

```typescript
// src/app/modules/index.ts
export { SampleModule } from './sample/sample.module.ts';
export { UserModule } from './user/user.module.ts';
```

```typescript
// src/app/app.module.ts
import { Module } from '@nestjs/common';
import { SampleModule, UserModule } from './modules/index.ts';

@Module({ imports: [SampleModule, UserModule] })
export class AppModule {}
```

## Layering & responsibilities

- **Controllers** — HTTP only: routing, status codes, delegating to services. Keep thin.
  Apply `@ApiKey()` and attach docs with `@ApplyControllerDocs(...)`.
- **Services** — business logic, `@Injectable()`, dependencies via constructor injection.
- **Schemas/DTOs** — `ZodDto` classes; the single source of validation and OpenAPI shape.
- **Docs** — a colocated `*.controller.docs.ts` using `DecoratorsLookUp` for type safety.

Worked code for each layer is in [patterns](patterns.instructions.md).

## Import path conventions

- **Libraries:** path aliases — `#libs/zod`, `#libs/http`, `#libs/decorators` (and `#testing`).
- **App-level decorators** (`src/app/decorators/`): relative imports, e.g.
  `import { ApiKey, AllowAnonymous } from '../../decorators/api-key.guard.ts';`
- **Within/across modules:** relative imports with explicit `.ts` extensions.
- Group imports: external packages → `#libs/*` → relative. Avoid circular dependencies;
  expose libraries and modules through their `index.ts` barrel.

## Security architecture

`@ApiKey` / `@AllowAnonymous` are created from `createSecurityGuard()` (`#libs/decorators`)
in `src/app/decorators/api-key.guard.ts`. Apply `@ApiKey()` at the controller class level and
mark individual public endpoints with `@AllowAnonymous()`. Build additional role/permission
guards with the same factory. Validation guards (`ZodValidationPipe`) run on every DTO input.

## Performance guidelines

- Keep modules cohesive; export only the public surface from each `index.ts`.
- Consider caching, pagination, and query optimization in services (recipes in
  [patterns](patterns.instructions.md)). Avoid circular module dependencies.
