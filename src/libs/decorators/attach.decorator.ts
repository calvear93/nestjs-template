export type NewableClass<T> = new (...params: any[]) => T;

export type AttachDecorator<T extends NewableClass<T>> = (target: T) => void;

export type DecoratorsLookUp<T> = {
	[K in keyof T]?: (MethodDecorator | PropertyDecorator)[];
} & { __class__?: ClassDecorator[] };

/**
 * Decorator factory for apply many decorators
 * to class members in a clean way.
 *
 * @example
 * ```ts
 *  // any.component.docs.ts
 *  import { DecoratorsLookUp } from '...';
 *
 *  export const AnyComponentDocs: DecoratorsLookUp<any> = {
 *	  anyMethod: [AnyDecorator()]
 *  };
 *
 *  // any.component.ts
 *  import { AttachDecorators } from '...';
 *  import { AnyComponentDocs } from '...';
 *
 *  @AttachDecorators(AnyComponentDocs)
 *  export class AnyComponent { ... }
 * ```
 * @typeParam T - class for apply decorators
 * @typeParam D - decorators lookup
 *
 * @param decorators - lookup with an array of decorators
 *
 * @returns class decorator
 */
export function Attach<T extends NewableClass<T>>({
	__class__ = [],
	...propsDecorators
}: DecoratorsLookUp<T>): AttachDecorator<T> {
	type PropsLookup = (keyof Omit<T, '__class__'>)[];
	const membersKeys = Object.keys(propsDecorators) as PropsLookup;

	return (target) => {
		// apply class decorators
		for (const decorator of __class__) decorator(target);

		// apply members decorators
		for (const key of membersKeys) {
			const decorators = propsDecorators[key];

			const property = Object.getOwnPropertyDescriptor(
				target.prototype,
				key
			);

			if (property && decorators) {
				for (const decorator of decorators)
					decorator(property.value, property.value.name, property);
			}
		}
	};
}
