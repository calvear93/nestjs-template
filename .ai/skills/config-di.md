# Skill: configuration, DI and integrations

Env details: [`env/README.md`](../../env/README.md). HTTP client:
[`src/libs/http/README.md`](../../src/libs/http/README.md). Guards:
[`src/libs/decorators/README.md`](../../src/libs/decorators/README.md).

## Env → code

1. Non-secret values go in `env/appsettings.json` (`|DEFAULT|`, `|MODE|`, `|ENV|`, `|LOCAL|`
   sections). Secrets go in `env/<env>.env.json` and personal overrides in
   `<env>.local.env.json` (both gitignored). Nested keys flatten with `_`
   (`SECURITY.API_KEY` → `SECURITY_API_KEY`). Every value arrives as a **string**.
2. Don't type it by hand: `src/env.d.ts` registers `appsettings.json` and the schema in
   `@calvear/env`, which types `process.env` by itself (booleans `'false' | 'true'`, the rest
   `string`). Only a variable set outside `@calvear/env` goes in its `overrides`. Then run
   `pnpm env:schema`.
3. Read `process.env` **only at module level**, never inside functions, methods or class
   properties (ESLint `no-restricted-syntax`). Two options:
    - **A constant at the top of the file:** `const API_URL = process.env.API_URL;`. Use it for
      simple, static values (see `main.ts`, `api-key.guard.ts`). It is read when the file is
      imported, so tests must set the env before a dynamic `import()` (see
      `api-key.guard.spec.ts`).
    - **DI:** options passed to a module's `register()` or a factory provider. Use it when the
      value needs validation, is shared across modules, or must be mocked without re-importing:

```ts
// users.module.ts — decorator args are module level, so reading env here is allowed
HttpModule.register({ url: process.env.USERS_API_URL, timeout: 5000 }),
// or a validated value:
{ provide: 'USERS_CONFIG', useValue: UsersConfigSchema.parse({ url: process.env.USERS_API_URL }) }

// service side
constructor(@Inject('USERS_CONFIG') private readonly _config: UsersConfig) {}
```

## Providers

- Use `@Injectable()`, add it to the module's `providers`, inject it via the constructor
  (`private readonly _x`). Register new modules in `src/app/modules/index.ts`.
- No `@nestjs/config` and no Express (lint-enforced).

## HTTP client (`#libs/http`)

- `HttpModule.register({ url, timeout, headers, useToken?, global? })`, then inject
  `HttpClient` (or the `useToken`).
- Calls return `HttpResponse<R>`, so read the body with `await res.json()`. A non-2xx response
  throws `HttpError` (`status`, `statusText`, `response`, `json()`), and a timeout throws
  `TimeoutError`. Don't check `res.ok`.

## Security

- `[ApiKey, AllowAnonymous]` come from `src/app/decorators/api-key.guard.ts`, built with
  `createSecurityGuard(Guard, enabled, ...args)`, which returns a **2-tuple**.
- The guard is off unless `SECURITY_ENABLED=true`. The header is `SECURITY_HEADER_NAME` (default
  `x-api-key`) and the value is `SECURITY_API_KEY`. Env is read at import time, so tests must set
  it before importing. A missing or bad key gets a 401.
- A new guard implements `SecurityGuard`; extra `canActivate` args are injected from the factory
  args, left to right.
