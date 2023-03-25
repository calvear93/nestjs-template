type ExtractMembersMatching<T, V, R> = {
	[K in keyof T as T[K] extends V | undefined ? K : never]?: R;
};

/**
 * Allows to define decorators for class, methods
 * or properties for apply to class.
 */
export interface DecoratorsLookUp<T extends object = any> {
	class?: ClassDecorator[];
	method?: ExtractMembersMatching<T, Function, MethodDecorator[]>;
	properties?: ExtractMembersMatching<T, PropertyKey, MethodDecorator[]>;
}

/**
 * Decorator factory for apply many decorators
 * to class and its methods in a clean way.
 *
 * @example
 * ```ts
 *  // any.class.decorators.ts
 *  import { DecoratorsLookUp } from '...';
 *
 *  export const AnyClassDecorators: DecoratorsLookUp<AnyClass> = {
 *	  class: [AnyClassDecorator()],
 *	  method: {}
 *		anyMethod: [AnyMethodDecorator()]
 *	  }
 *  };
 *
 *  // any.class.ts
 *  import { ApplyToClass } from '...';
 *  import { AnyClassDecorators } from '...';
 *
 *  @ApplyToClass(AnyClassDecorators)
 *  export class AnyClass { ... }
 * ```
 *
 * @param decorators - lookup with an array of decorators
 *
 * @returns class decorator
 */
export function ApplyToClass({
	class: __class__ = [],
	method,
}: DecoratorsLookUp): ClassDecorator {
	return <T extends Function>(target: T) => {
		// apply class decorators
		for (const decorator of __class__) decorator(target);

		if (!method) return;

		// apply method decorators
		for (const key of Object.keys(method)) {
			const decorators = method[key];

			const property = Object.getOwnPropertyDescriptor(
				target.prototype,
				key,
			);

			if (property && decorators) {
				for (const decorator of decorators)
					decorator(property.value, property.value.name, property);
			}
		}
	};
}

/**
 * Decorator factory for apply many decorators
 * to class properties in a clean way.
 *
 * @example
 * ```ts
 *  // any.class.decorators.ts
 *  import { DecoratorsLookUp } from '...';
 *
 *  export const AnyClassDecorators: DecoratorsLookUp<AnyClass> = {
 *	  properties: {}
 *		anyProp: [AnyPropertyDecorator()]
 *	  }
 *  };
 *
 *  // any.class.ts
 *  import { ApplyToProperty } from '...';
 *  import { AnyClassDecorators } from '...';
 *
 *  export class AnyClass {
 * 		@ApplyToProperty(AnyClassDecorators)
 *		anyProp: string;
 *  }
 * ```
 *
 * @param decorators - lookup with an array of decorators
 *
 * @returns property decorator
 */
export function ApplyToProperty({
	properties,
}: DecoratorsLookUp): PropertyDecorator {
	if (!properties) return () => void 0;

	return <T extends object, Y>(
		target: T,
		key: PropertyKey,
		descriptor?: TypedPropertyDescriptor<Y>,
	) => {
		const decorators = properties[key as any];

		if (!decorators) return;

		// apply property decorators
		for (const decorator of decorators) {
			decorator(target, key as any, descriptor as any);
		}
	};
}
