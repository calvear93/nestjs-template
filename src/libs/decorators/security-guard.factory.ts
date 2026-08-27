/* eslint-disable unicorn/consistent-function-scoping */
import {
	applyDecorators,
	type ExecutionContext,
	UseGuards,
} from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import type { Class } from 'type-fest';
import {
	type CanActivateArgs,
	isFn,
	isString,
	type Optional,
	type SubtractLeft,
} from './security-guard.factory.types.ts';

/**
 * Sets a flag using reflect-metadata.
 */
const setSignal = (
	signal: symbol,
	value: boolean,
	target: object,
	key?: PropertyKey,
) => {
	if (!key) return;
	Reflect.defineMetadata(signal, value, target, key.toString());
};

/**
 * Gets a flag using reflect-metadata.
 */
const getSignal = (signal: symbol, target: object, key: string): boolean => {
	return Reflect.getMetadata(signal, target, key);
};

/**
 * Stores an array into metadata.
 */
const setArgs = (
	accessKey: symbol,
	args: any[],
	descriptor?: PropertyDescriptor,
) => {
	if (descriptor) Reflect.defineMetadata(accessKey, args, descriptor.value);
};

/**
 * Retrieves an array from metadata.
 */
const getArgs = (accessKey: symbol, descriptor: Function) => {
	return Reflect.getMetadata(accessKey, descriptor);
};

/**
 * Decorator for injects args
 * in 'canActivate' method.
 */
const argsInjector = (
	accessKey: symbol,
	target: object,
	propertyKey: PropertyKey,
	descriptor: PropertyDescriptor,
) => {
	const method = descriptor.value;

	descriptor.value = function (context: ExecutionContext) {
		const args = getArgs(accessKey, context.getHandler()) ?? [];
		return method.call(this, context, ...args);
	};
	// overrides wrapped method
	Object.defineProperty(target, propertyKey, descriptor);
};

// shared metadata key for the args injected into `canActivate`
const SECURITY_ARGS = Symbol('security-guard:args');
// marks a guard prototype as already wrapped, so reusing a guard class across
// several factories never wraps `canActivate` more than once
const SECURITY_WRAPPED = Symbol('security-guard:wrapped');

/**
 * Decorates "canActivate" method with args injector for improved configuration
 * injection. Idempotent: a guard prototype is wrapped at most once, even when the
 * same guard class is shared by several `createSecurityGuard` factories.
 */
const wrapWithArgsInjector = (Guard: Class<SecurityGuard>) => {
	const proto = Guard.prototype as Record<PropertyKey, unknown>;
	if (proto[SECURITY_WRAPPED]) return;

	const { canActivate } = Object.getOwnPropertyDescriptors(Guard.prototype);
	if (!canActivate?.value) return;

	argsInjector(
		SECURITY_ARGS,
		Guard.prototype,
		canActivate.value.name,
		canActivate,
	);
	proto[SECURITY_WRAPPED] = true;
};

/**
 * Decorates your controller or method
 * with a security guard, and applies
 * Swagger security schema.
 */
const createSecureDecorator = <G extends SecurityGuard, A extends any[]>(
	Guard: Class<G>,
	guardName: string,
	allowSignal: symbol,
	sharedArgs: any[],
) => {
	const guard = UseGuards(Guard);
	const schema = ApiSecurity(guardName);

	// metadata accessors
	const lockSignal = Symbol(guardName);

	wrapWithArgsInjector(Guard);

	const apply = (descriptor: PropertyDescriptor) => {
		applyDecorators(guard, schema)(
			descriptor.value,
			descriptor.value.name,
			descriptor,
		);
	};

	return (...args: A): ClassDecorator & MethodDecorator => {
		args = [...sharedArgs, ...args] as any;
		return <T extends Function>(
			target: T | object,
			propertyKey?: PropertyKey,
			descriptor?: PropertyDescriptor,
		) => {
			// method decoration
			if (!isFn(target)) {
				// enables lock for avoid re-apply guard in class decoration
				setSignal(lockSignal, true, target, propertyKey);
				// stores args for injection in canActivate method
				setArgs(SECURITY_ARGS, args, descriptor);
				return descriptor && apply(descriptor);
			}

			// class decoration
			const descriptors = Object.getOwnPropertyDescriptors(
				target.prototype,
			);

			const keys = Object.keys(descriptors).filter<string>(isString);

			// apply to class methods
			for (const key of keys) {
				const locked = getSignal(lockSignal, target.prototype, key);
				const ignored = getSignal(allowSignal, target.prototype, key);
				const propertyDescriptor = descriptors[key];

				// if no args from method, uses class args
				if (!getArgs(SECURITY_ARGS, propertyDescriptor.value))
					setArgs(SECURITY_ARGS, args, propertyDescriptor);

				if (ignored || locked || key === 'constructor') continue;

				apply(propertyDescriptor);
			}
		};
	};
};

/**
 * Decorates your method
 * for ignores to apply security.
 */
const createAllowDecorator = (allowSignal: symbol) => {
	return (): MethodDecorator => {
		return (target: object, key: PropertyKey) => {
			setSignal(allowSignal, true, target, key);
		};
	};
};

const voided = () => void 0;
const disabled = () => voided;

/**
 * Factory function that creates a pair of security decorators for NestJS applications.
 *
 * This function generates two decorators:
 * 	1. **Security Decorator**: Applies the guard to protect endpoints
 * 	2. **Allow Anonymous Decorator**: Bypasses the guard for specific endpoints
 *
 * The factory lets you pre-configure some `canActivate` parameters while leaving
 * others to be provided at decoration time. Note these are two different
 * mechanisms living together: the **guard itself** is handed to `UseGuards` as a
 * class, so Nest resolves it from its container by DI, while the **arguments**
 * travel through `reflect-metadata` and are spread after `context`. An injectable
 * provider is therefore not something you can pass as an argument.
 *
 * **Key Features:**
 * 	- Type-safe argument injection based on your guard's `canActivate` signature
 * 	- Conditional enabling/disabling of security based on environment or configuration
 * 	- Automatic symbol-based metadata management for allow/deny patterns
 * 	- A guard class can be shared by several factories: its `canActivate` is
 * 	  wrapped at most once, and each factory injects its own arguments
 * 	- Full compatibility with NestJS guard ecosystem
 *
 * **Argument Injection Logic:**
 * 	Arguments are injected from left to right based on the `canActivate` method signature.
 * 	Parameters provided to `createSecurityGuard` are injected first, followed by
 * 	parameters provided when using the resulting decorator.
 * 	When the decorator is applied to a class, a method that already carries its own
 * 	arguments keeps them: the class level ones only fill in the methods without any.
 *
 * **Swagger:**
 * 	The protect decorator also applies `ApiSecurity(Guard.name)`, so the scheme must
 * 	be registered under that very name, i.e.
 * 	`.addApiKey(SECURITY_API_SCHEMA, ApiKeyGuard.name)` in `src/app/app.ts`.
 *
 * @param Guard - The guard class that implements SecurityGuard interface
 * @param enabled - Whether the security guard is active (default: true). When false both
 * 	decorators become no-ops and the guard is never registered, so the routes are left
 * 	unprotected rather than protected by default
 * @param args - Pre-configured arguments to inject into the guard's canActivate method (from left to right)
 * @returns A tuple containing [SecurityDecorator, AllowAnonymousDecorator]
 *
 * @example
 * Basic API Key Guard:
 * ```ts
 * import { createSecurityGuard, type SecurityGuard } from '#libs/decorators';
 * import {
 *	ExecutionContext,
 *	Injectable,
 *	UnauthorizedException,
 * } from '@nestjs/common';
 *
 * \@Injectable()
 * export class ApiKeyGuard implements SecurityGuard {
 *	// headerName and apiKey are injected by the decorator, not read here
 *	canActivate(
 *		context: ExecutionContext,
 *		headerName: string,
 *		apiKey: string,
 *	): boolean {
 *		const { headers } = context.switchToHttp().getRequest();
 *		const received = headers[headerName];
 *
 *		// returning false would make Nest answer 403; 401 is "who are you"
 *		if (received !== apiKey)
 *			throw new UnauthorizedException('Api key is not valid');
 *
 *		return true;
 *	}
 * }
 *
 * // Create the decorators, pre-configuring both injected args
 * export const [ApiKey, AllowAnonymous] = createSecurityGuard(
 *	ApiKeyGuard,
 *	process.env.SECURITY_ENABLED === 'true',
 *	process.env.SECURITY_HEADER_NAME, // injected as headerName
 *	process.env.SECURITY_API_KEY,     // injected as apiKey
 * );
 *
 * // app.ts, registered under the guard class name
 * new DocumentBuilder().addApiKey(SECURITY_API_SCHEMA, ApiKeyGuard.name);
 *
 * // Usage in controllers
 * \@Controller('protected')
 * \@ApiKey()
 * export class ProtectedController {
 *	\@Get('secure')
 *	secureEndpoint() {
 *		return { message: 'This endpoint requires API key' };
 *	}
 *
 *	\@Get('public')
 *	\@AllowAnonymous()
 *	publicEndpoint() {
 *		return { message: 'This endpoint is public' };
 *	}
 * }
 * ```
 *
 * @example
 * Role-based Guard with Argument Injection:
 * ```ts
 * \@Injectable()
 * export class RoleGuard implements SecurityGuard {
 *	canActivate(
 *		context: ExecutionContext,
 *		requiredRole: string,
 *		allowSuperAdmin: boolean = false
 *	): boolean {
 *		const request = context.switchToHttp().getRequest();
 *		const userRole = request.user?.role;
 *
 *		if (allowSuperAdmin && userRole === 'super-admin') return true;
 *		return userRole === requiredRole;
 *	}
 * }
 *
 * // Pre-configure the allowSuperAdmin parameter
 * export const [RequireRole, AllowAnonymous] = createSecurityGuard(
 *	RoleGuard,
 *	true,
 *	true // allowSuperAdmin = true
 * );
 *
 * // Usage - only need to provide the requiredRole parameter
 * \@Controller('admin')
 * export class AdminController {
 *	\@Get('dashboard')
 *	\@RequireRole('admin') // requiredRole parameter
 *	dashboard() {
 *		return { message: 'Admin dashboard' };
 *	}
 *
 *	\@Get('users')
 *	\@RequireRole('user') // requiredRole parameter
 *	users() {
 *		return { message: 'User list' };
 *	}
 * }
 * ```
 *
 * @example
 * Conditional Security (Environment-based):
 * ```ts
 * // Disable security in development
 * const isProduction = process.env.NODE_ENV === 'production';
 *
 * export const [JwtSecurity, AllowAnonymous] = createSecurityGuard(
 *	JwtAuthGuard,
 *	isProduction // Only enable in production
 * );
 *
 * // In development, all endpoints behave as if they have \@AllowAnonymous()
 * // In production, normal JWT validation applies
 * ```
 *
 * @example
 * Complex Argument Injection:
 * ```ts
 * \@Injectable()
 * export class PermissionGuard implements SecurityGuard {
 *	canActivate(
 *		context: ExecutionContext,
 *		resource: string,
 *		action: string,
 *		requireOwnership: boolean,
 *		allowedRoles: string[]
 *	): boolean {
 *		// Implementation here...
 *		return true;
 *	}
 * }
 *
 * // Pre-configure resource and action
 * export const [PostPermission, AllowAnonymous] = createSecurityGuard(
 *	PermissionGuard,
 *	true,
 *	'posts',  // resource parameter
 *	'read'    // action parameter
 * );
 *
 * // Usage - provide remaining parameters (requireOwnership, allowedRoles)
 * \@Controller('posts')
 * export class PostController {
 *	\@Get(':id')
 *	\@PostPermission(false, ['user', 'admin']) // requireOwnership, allowedRoles
 *	getPost() {
 *		return { message: 'Post content' };
 *	}
 * }
 * ```
 */
export const createSecurityGuard = <
	G extends SecurityGuard,
	A extends CanActivateArgs<G['canActivate']>,
	SA extends Optional<A>,
>(
	Guard: Class<G>,
	enabled = true,
	...args: SA
): [
	ReturnType<typeof createSecureDecorator<G, SubtractLeft<A, SA>>>,
	ReturnType<typeof createAllowDecorator>,
] => {
	if (!enabled) return [disabled, disabled];

	const signal = Symbol(Guard.name);

	const Secure = createSecureDecorator(Guard, Guard.name, signal, args);
	const Allow = createAllowDecorator(signal);

	return [Secure, Allow];
};

/**
 * Contract every guard built by `createSecurityGuard` must implement.
 *
 * It widens Nest's own `CanActivate`: the first parameter is always the
 * `ExecutionContext`, and any parameter after it is configuration injected by
 * the decorator, never resolved by Nest DI.
 *
 * @see createSecurityGuard
 */
export interface SecurityGuard {
	canActivate(
		context: ExecutionContext,
		...args: any[]
	): Promise<boolean> | boolean;
}
