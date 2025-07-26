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
	type SubstractLeft,
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
const getSignal = (signal: symbol, target: object, key?: string): boolean => {
	if (!key) return false;
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
	descriptor?: PropertyDescriptor,
) => {
	const method = descriptor?.value;

	if (method) {
		descriptor.value = function (context: ExecutionContext) {
			const args = getArgs(accessKey, context.getHandler());
			return method.call(this, context, ...args);
		};
		// overrides wrapped method
		Object.defineProperty(target, propertyKey, descriptor);
	}
};

/**
 * Decorates "canActivate" method with args
 * injector for improved configuration injection
 */
const wrapWithArgsInjector = (Guard: Class<SecurityGuard>, key: symbol) => {
	const { canActivate } = Object.getOwnPropertyDescriptors(Guard.prototype);
	if (!canActivate.value) return;

	argsInjector(key, Guard.prototype, canActivate.value.name, canActivate);
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
	const argsAccessKey = Symbol(guardName);

	wrapWithArgsInjector(Guard, argsAccessKey);

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
				setArgs(argsAccessKey, args, descriptor);
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
				if (!getArgs(argsAccessKey, propertyDescriptor.value))
					setArgs(argsAccessKey, args, propertyDescriptor);

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
 * The factory supports dependency injection for guard arguments, allowing you to
 * pre-configure some parameters while leaving others to be provided at decoration time.
 * This enables flexible and reusable security configurations across your application.
 *
 * **Key Features:**
 * 	- Type-safe argument injection based on your guard's `canActivate` signature
 * 	- Conditional enabling/disabling of security based on environment or configuration
 * 	- Automatic symbol-based metadata management for allow/deny patterns
 * 	- Full compatibility with NestJS guard ecosystem
 *
 * **Argument Injection Logic:**
 * 	Arguments are injected from left to right based on the `canActivate` method signature.
 * 	Parameters provided to `createSecurityGuard` are injected first, followed by
 * 	parameters provided when using the resulting decorator.
 *
 * @param Guard - The guard class that implements SecurityGuard interface
 * @param enabled - Whether the security guard is active (default: true). When false, both decorators become no-ops
 * @param args - Pre-configured arguments to inject into the guard's canActivate method (from left to right)
 * @returns A tuple containing [SecurityDecorator, AllowAnonymousDecorator]
 *
 * @example
 * Basic API Key Guard:
 * ```ts
 * import { createSecurityGuard } from '#libs/decorators';
 * import { ExecutionContext, Injectable } from '@nestjs/common';
 *
 * \@Injectable()
 * export class ApiKeyGuard implements SecurityGuard {
 *	canActivate(context: ExecutionContext): boolean {
 *		const request = context.switchToHttp().getRequest();
 *		const apiKey = request.headers['x-api-key'];
 *		return apiKey === process.env.API_KEY;
 *	}
 * }
 *
 * // Create the decorators
 * export const [ApiKeySecurity, AllowAnonymous] = createSecurityGuard(ApiKeyGuard);
 *
 * // Usage in controllers
 * \@Controller('protected')
 * \@ApiKeySecurity()
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
	ReturnType<typeof createSecureDecorator<G, SubstractLeft<A, SA>>>,
	ReturnType<typeof createAllowDecorator>,
] => {
	if (!enabled) return [disabled, disabled];

	const signal = Symbol(Guard.name);

	const Secure = createSecureDecorator(Guard, Guard.name, signal, args);
	const Allow = createAllowDecorator(signal);

	return [Secure, Allow];
};

export interface SecurityGuard {
	canActivate(
		context: ExecutionContext,
		...args: any[]
	): Promise<boolean> | boolean;
}
