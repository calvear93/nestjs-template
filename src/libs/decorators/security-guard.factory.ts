import { UseGuards, applyDecorators } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import type { Class } from 'type-fest';

const isString = (key: PropertyKey): key is string => typeof key === 'string';

const isFn = (value: Function | object): value is Function =>
	value instanceof Function;

/**
 * Decorates your controller or method
 * with a security guard, and applies
 * Swagger security schema.
 */
const createSecureDecorator = <G extends Class<any>>(
	Guard: G,
	guardName: string,
	allowSignal: symbol,
	args: ConstructorParameters<G> | never[],
) => {
	const guard = UseGuards(args.length === 0 ? Guard : new Guard(...args));
	const schema = ApiSecurity(guardName);

	const apply = (descriptor: PropertyDescriptor) =>
		applyDecorators(guard, schema)(
			descriptor.value,
			descriptor.value.name,
			descriptor,
		);

	return (): ClassDecorator & MethodDecorator => {
		return <T extends Function>(
			target: T | object,
			_?: PropertyKey,
			descriptor?: PropertyDescriptor,
		) => {
			// class decoration
			if (!isFn(target)) {
				return descriptor && apply(descriptor);
			}

			// method decoration
			const descriptors = Object.getOwnPropertyDescriptors(
				target.prototype,
			);

			const keys = Object.keys(descriptors).filter<string>(isString);

			// apply to class methods
			for (const key of keys) {
				const ignore = Reflect.getMetadata(
					allowSignal,
					target.prototype,
					key,
				);

				if (ignore || key === 'constructor') continue;

				apply(descriptors[key]);
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
			if (isString(key)) {
				Reflect.defineMetadata(allowSignal, true, target, key);
			}
		};
	};
};

// eslint-disable-next-line unicorn/consistent-function-scoping
const disabled = () => () => void 0;

/**
 * Generates a protect and allow
 * decorator for your security guard.
 *
 * @param Guard - guard class
 * @param enabled - if enabled
 * @param args - guard args, if you use Nest DI, don't pass them
 */
export const createSecurityGuard = <T extends Class<any>>(
	Guard: T,
	enabled = true,
	...args: ConstructorParameters<T> | never[]
): [
	ReturnType<typeof createSecureDecorator>,
	ReturnType<typeof createAllowDecorator>,
] => {
	if (!enabled) return [disabled, disabled];

	const signal = Symbol(Guard.name);

	const Secure = createSecureDecorator(Guard, Guard.name, signal, args);
	const Allow = createAllowDecorator(signal);

	return [Secure, Allow];
};
