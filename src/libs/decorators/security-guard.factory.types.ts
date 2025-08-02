import type { ExecutionContext } from '@nestjs/common';

export type CanActivateArgs<T> = T extends (
	ctx: ExecutionContext,
	...args: infer A
) => any
	? A
	: never;

export type Optional<T> = {
	[K in keyof T]?: T[K];
};

export type SubstractLeft<T extends any[], U extends any[]> = T extends [
	infer F,
	...infer R,
]
	? U extends [infer G, ...infer S]
		? F extends G
			? SubstractLeft<R, S>
			: [F, ...SubstractLeft<R, U>]
		: T
	: [];

export const isString = (key: PropertyKey): key is string =>
	typeof key === 'string';

export const isFn = (value: Function | object): value is Function =>
	value instanceof Function;
