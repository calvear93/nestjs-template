import { UseGuards, applyDecorators } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import type { Class } from 'type-fest';

const isString = (key: PropertyKey): key is string => typeof key === 'string';

const isFn = (value: Function | object): value is Function =>
	value instanceof Function;

const setSignal = (
	signal: symbol,
	value: any,
	target: object,
	key?: PropertyKey,
) => {
	if (!key) return;
	Reflect.defineMetadata(signal, value, target, key.toString());
};

const getSignal = (signal: symbol, target: object, key?: string) => {
	if (!key) return null;
	return Reflect.getMetadata(signal, target, key);
};

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

	const lockSignal = Symbol(guardName);

	const apply = (descriptor: PropertyDescriptor) => {
		applyDecorators(guard, schema)(
			descriptor.value,
			descriptor.value.name,
			descriptor,
		);
	};

	return (): ClassDecorator & MethodDecorator => {
		return <T extends Function>(
			target: T | object,
			propertyKey?: PropertyKey,
			descriptor?: PropertyDescriptor,
		) => {
			// method decoration
			if (!isFn(target)) {
				// enables lock for avoid re-apply guard in class decoration
				setSignal(lockSignal, true, target, propertyKey);
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

				if (ignored || locked || key === 'constructor') continue;

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
