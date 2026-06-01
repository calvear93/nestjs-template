# Skill: Dependency injection (NestJS)

Wire services and configuration through NestJS's built-in IoC container instead of
hardcoding or importing singletons directly.

## When to use

Adding a service/config dependency, consuming one in a controller/service, or mocking one in tests.

## Guidelines

- Mark providers with `@Injectable()`; inject through the constructor with
  `private readonly _dep: Dep`. Register them in a module's `providers` array.
- **Bind configuration with a `useFactory` provider** placed in `src/app/config/` and keyed
  by a token; never read `process.env` inside services/controllers — keep env access in the
  config layer only (see `vite-config` skill and `AGENTS.md`).
- Inject token-based providers with `@Inject('TOKEN')`.
- To share a provider across modules, add it to the owning module's `exports` and `import`
  that module where needed.

## Provide (module + factory)

```typescript
import { Module } from '@nestjs/common';
import { UserService } from './services/user.service.ts';

const APP_CONFIG = 'APP_CONFIG';

@Module({
	exports: [UserService],
	providers: [
		UserService,
		{
			provide: APP_CONFIG,
			// read env only here, in the config layer
			useFactory: (): { apiUrl: string } => ({
				apiUrl: process.env.APP_API_URL ?? '',
			}),
		},
	],
})
export class UserModule {}
```

## Consume (service)

```typescript
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
	constructor(@Inject('APP_CONFIG') private readonly _config: AppConfig) {}
}
```

## Test (override)

Substitute dependencies with `mock<T>()` from `vitest-mock-extended` via `useValue`:

```typescript
import { Test } from '@nestjs/testing';
import { mock } from 'vitest-mock-extended';

const httpClient = mock<HttpClient>();

const module = await Test.createTestingModule({
	providers: [UserService, { provide: HttpClient, useValue: httpClient }],
}).compile();
```

See `.github/instructions/architecture-guide.instructions.md` → Configuration architecture.
