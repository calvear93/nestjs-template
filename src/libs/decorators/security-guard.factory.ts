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
 * Generates a protect and allow
 * decorator for your security guard.
 *
 * @example
 * ```ts
 *	// define your authorization logic
 *	import { createSecurityGuard } from '#libs/decorators';
 *
 *	export class AnyGuard implements SecurityGuard {
 *		canActivate(
 *			context: ExecutionContext,
 *			... // any custom argument
 *		): boolean | Promise<boolean> {
 *			// validation logic here
 *		}
 *	};
 *
 *	// create your SecurityGuard
 *	export const [AnySecurity, AllowAnonymous] = createSecurityGuard(
 *		AnyGuard,
 *		true, // if enabled or disabled
 *		... // any parameter defined after context in "canActivate", optional
 *	);
 *
 *	[i] method injection works for every parameter defined after ExecutionContext
 *		in "canActivate" method, for inject values in "createSecurityGuard" but,
 *		any argument not defined here, must be provided in decorator created.
 *		i.e.
 *		1. canActivate(ctx: ExecutionContext, arg1: string, arg2: number, arg3: boolean)
 *		2. const { MySecurity } = createSecurityGuard(Guard, true, "string") // arg1 used here
 *		3. \@MySecurity(10, false) // rest or args (arg2 and arg3) must be passed here
 * ```
 *
 * @param Guard - guard class
 * @param enabled - if enabled
 * @param args - shared args, defined from left to right in "canActivate"
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
