import {
	ApplyToClass,
	ApplyToProperty,
	type DecoratorsLookUp,
} from '../../libs/decorators/apply.decorator.js';

/**
 * Decorator factory for apply Swagger
 * docs to Controller and its methods.
 *
 * @param decorators - lookup with an array of decorators
 *
 * @returns class decorator if swagger is enabled
 */
export function ApplyControllerDocs(
	decorators: DecoratorsLookUp,
): ClassDecorator {
	return process.env.SWAGGER_UI === 'true'
		? ApplyToClass(decorators)
		: () => void 0;
}

/**
 * Decorator factory for apply Swagger
 * docs to DTOs properties.
 *
 * @param decorators - lookup with an array of decorators
 *
 * @returns property decorator if swagger is enabled
 */
export function ApplyDtoDocs(decorators: DecoratorsLookUp): PropertyDecorator {
	return process.env.SWAGGER_UI === 'true'
		? ApplyToProperty(decorators)
		: () => void 0;
}
