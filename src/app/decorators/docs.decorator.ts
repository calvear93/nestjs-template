import {
	Attach,
	AttachDecorator,
	DecoratorsLookUp,
	NewableClass,
} from '../../libs/decorators/attach.decorator.js';

/**
 * Decorator factory for apply Swagger docs.
 *
 * @typeParam T - class for apply decorators
 * @typeParam D - decorators lookup
 *
 * @param decorators - lookup with an array of decorators
 *
 * @returns class decorator if swagger is enabled
 */
export function AttachDocs<T extends NewableClass<T>>(
	decorators: DecoratorsLookUp<T>
): AttachDecorator<T> {
	return process.env.SWAGGER_UI === 'true'
		? Attach(decorators)
		: () => void 0;
}
