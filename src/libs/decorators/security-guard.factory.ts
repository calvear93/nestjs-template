import type { Class } from 'type-fest';
import { ApiSecurity } from '@nestjs/swagger';
import { applyDecorators, UseGuards } from '@nestjs/common';

const isString = (key: PropertyKey): key is string => typeof key === 'string';

const isFn = (value: Function | object): value is Function =>
	value instanceof Function;

/**
 * Decorates your controller or method
 * with a security guard, and applies
 * Swagger security schema.
 */
const createSecureDecorator = <T extends Class<any>>(
	Guard: T,
	guardName: string,
	allowSignal: symbol,
	args: ConstructorParameters<T>,
) => {
	const apply = (descriptor: PropertyDescriptor) =>
		applyDecorators(UseGuards(new Guard(...args)), ApiSecurity(guardName))(
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
			// method decoration
			if (!isFn(target)) {
				return descriptor && apply(descriptor);
			}

			// class decoration
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
 */
export const SecurityGuardFactory = <T extends Class<any>>(
	Guard: T,
	name: string,
	enabled = true,
	...args: ConstructorParameters<T>
): [
	ReturnType<typeof createSecureDecorator>,
	ReturnType<typeof createAllowDecorator>,
] => {
	if (!enabled) return [disabled, disabled];

	const signal = Symbol(name);

	const Secure = createSecureDecorator(Guard, name, signal, args);
	const Allow = createAllowDecorator(signal);

	return [Secure, Allow];
};
