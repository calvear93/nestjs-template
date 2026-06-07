# 🔐 `#libs/decorators` — Decorator Toolkit

> Two composable utilities for clean NestJS controllers: a **security-guard factory** (guard + Swagger schema + arg injection + on/off switch) and a **declarative decorator applier** that keeps cross-cutting decorators out of your class body.

## ✨ Highlights

- **`createSecurityGuard`** — turn any guard into a `[Secure, Allow]` pair: protect a controller, exempt single routes, and **inject pre-configured args** into `canActivate`.
- **Toggle security in one place** — pass `enabled: false` and both decorators become no-ops (great for local dev).
- **Swagger-aware** — applying the guard also adds `ApiSecurity(name)` to the OpenAPI doc.
- **`ApplyToClass` / `ApplyToProperty`** — describe which decorators go on which members in a plain object, then apply them with one decorator (the engine behind colocated `*.controller.docs.ts`).

## 📦 API at a glance

| Export                | Signature                                       | Use it to…                                        |
| --------------------- | ----------------------------------------------- | ------------------------------------------------- |
| `createSecurityGuard` | `(Guard, enabled?, ...args) => [Secure, Allow]` | build a guard decorator pair                      |
| `SecurityGuard`       | interface                                       | type your guard's `canActivate(context, ...args)` |
| `ApplyToClass`        | `(lookup) => ClassDecorator`                    | apply class/method decorators from a lookup       |
| `ApplyToProperty`     | `(lookup) => PropertyDecorator`                 | apply property decorators from a lookup           |
| `DecoratorsLookUp<T>` | type                                            | describe the `class` / `method` / `property` map  |

## 🛡️ Security guards

### Define a guard and create the decorators

```typescript
import { ExecutionContext, Injectable } from '@nestjs/common';
import { createSecurityGuard, type SecurityGuard } from '#libs/decorators';

@Injectable()
export class ApiKeyGuard implements SecurityGuard {
	canActivate(context: ExecutionContext, headerName: string, apiKey: string) {
		const req = context.switchToHttp().getRequest();
		return req.headers[headerName] === apiKey;
	}
}

// pre-configure header + key (and gate security behind a flag)
export const [ApiKey, AllowAnonymous] = createSecurityGuard(
	ApiKeyGuard,
	process.env.SECURITY_ENABLED === 'true',
	'x-api-key', //         injected as `headerName`
	process.env.API_KEY!, // injected as `apiKey`
);
```

### Protect a controller, exempt a route

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiKey, AllowAnonymous } from '../decorators/api-key.guard.ts';

@ApiKey() // guards every route + adds the Swagger security scheme
@Controller('reports')
export class ReportsController {
	@Get()
	list() {
		return [];
	}

	@Get('health')
	@AllowAnonymous() // opt this route out of the guard
	health() {
		return { ok: true };
	}
}
```

### Argument injection

Arguments flow left-to-right into `canActivate(context, ...args)`: those passed to `createSecurityGuard` come first, then those passed at the decoration site. TypeScript narrows the decorator to **only the remaining** parameters.

```typescript
@Injectable()
class RoleGuard implements SecurityGuard {
	canActivate(ctx: ExecutionContext, role: string, allowSuperAdmin = false) {
		/* … */ return true;
	}
}

// pre-fill `allowSuperAdmin`; the decorator now only asks for `role`
export const [RequireRole] = createSecurityGuard(RoleGuard, true, true);

@RequireRole('admin') // → canActivate(ctx, 'admin', true)
```

### Turn security off

```typescript
// in dev, both decorators become no-ops — every route behaves as anonymous
export const [JwtSecurity, AllowAnonymous] = createSecurityGuard(
	JwtGuard,
	process.env.NODE_ENV === 'production',
);
```

## 🧱 Declarative decorators (`ApplyToClass`)

Keep noisy cross-cutting decorators (Swagger docs, interceptors…) out of the class. Describe them in a `DecoratorsLookUp`, then apply with one decorator — this is exactly how colocated `*.controller.docs.ts` files work:

```typescript
// users.controller.docs.ts
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { DecoratorsLookUp } from '#libs/decorators';
import type { UsersController } from './users.controller.ts';

export const UsersControllerDocs: DecoratorsLookUp<UsersController> = {
	class: [ApiTags('users')],
	method: {
		list: [ApiOperation({ summary: 'List users' }), ApiOkResponse()],
	},
	common: {
		method: [
			/* decorators applied to every listed method */
		],
	},
};
```

```typescript
// users.controller.ts
import { ApplyToClass } from '#libs/decorators';
import { UsersControllerDocs } from './users.controller.docs.ts';

@ApplyToClass(UsersControllerDocs)
@Controller('users')
export class UsersController {
	list() {
		return [];
	}
}
```

`DecoratorsLookUp<T>` is type-checked against `T`, so `method` keys must be real methods of the controller. Use `ApplyToProperty` for property decorators.

## 🧪 Testing

`createSecurityGuard` returns ordinary NestJS decorators, so test the **guard** directly and assert routing behavior with `@nestjs/testing`:

```typescript
import { ExecutionContext } from '@nestjs/common';
import { mock } from 'vitest-mock-extended';

it('accepts the matching api key', () => {
	const ctx = mock<ExecutionContext>();
	ctx.switchToHttp().getRequest.mockReturnValue({
		headers: { 'x-api-key': 'secret' },
	});

	expect(new ApiKeyGuard().canActivate(ctx, 'x-api-key', 'secret')).toBe(
		true,
	);
});
```

> Disabled guards (`enabled: false`) are no-ops — assert that protected routes respond `200` without credentials in that mode.

## 🧠 How it works

`createSecurityGuard` builds a `Secure` decorator that runs `applyDecorators(UseGuards(Guard), ApiSecurity(name))`, and stores the injected args in `reflect-metadata` keyed by a unique `Symbol`; a wrapper around the guard's `canActivate` reads them back and spreads them after `context`. `Allow()` writes an "allow" signal on a method so class-level application skips it, and a per-method "lock" prevents double-applying when both class- and method-level decorators are present. When `enabled` is `false`, the factory returns two no-op functions. `ApplyToClass`/`ApplyToProperty` simply iterate the `DecoratorsLookUp` and invoke each decorator against the matching class, method descriptor, or property.
