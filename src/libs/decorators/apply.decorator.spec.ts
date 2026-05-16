import { describe, expect, test, vi } from 'vitest';
import {
	ApplyToClass,
	ApplyToProperty,
	type DecoratorsLookUp,
	getDecorators,
	isDecoratorsFn,
} from './apply.decorator.ts';

describe('apply decorators', () => {
	// tests
	describe(isDecoratorsFn, () => {
		test('returns true for a function value', () => {
			expect(isDecoratorsFn(() => ({}))).toBe(true);
		});

		test('returns false for a plain object value', () => {
			expect(isDecoratorsFn({})).toBe(false);
		});
	});

	describe(getDecorators, () => {
		test('returns the lookup object directly when not a function', () => {
			const lookup: DecoratorsLookUp = { class: [] };

			expect(getDecorators(lookup)).toBe(lookup);
		});

		test('invokes the lazy lookup function and returns its result', () => {
			const lookup: DecoratorsLookUp = { class: [] };
			const lazy = vi.fn(() => lookup);

			const result = getDecorators(lazy);

			expect(lazy).toHaveBeenCalledOnce();
			expect(result).toBe(lookup);
		});
	});

	describe(ApplyToClass, () => {
		test('applies class decorators to the target', () => {
			const classDecorator = vi.fn();

			class Sample {}
			ApplyToClass({ class: [classDecorator] })(Sample);

			expect(classDecorator).toHaveBeenCalledWith(Sample);
		});

		test('early returns when no method config is provided', () => {
			const classDecorator = vi.fn();

			class Sample {
				method() {
					return true;
				}
			}
			ApplyToClass({ class: [classDecorator] })(Sample);

			expect(classDecorator).toHaveBeenCalledOnce();
		});

		test('applies method and common decorators to existing methods', () => {
			const methodDecorator = vi.fn();
			const commonDecorator = vi.fn();

			class Sample {
				method() {
					return true;
				}
			}
			ApplyToClass({
				common: { method: [commonDecorator] },
				method: { method: [methodDecorator] },
			})(Sample);

			expect(methodDecorator).toHaveBeenCalledOnce();
			expect(commonDecorator).toHaveBeenCalledOnce();
		});

		test('skips method entry when the property descriptor is missing', () => {
			const methodDecorator = vi.fn();

			class Sample {}
			ApplyToClass({
				method: { method: [methodDecorator] },
			} as DecoratorsLookUp)(Sample);

			expect(methodDecorator).not.toHaveBeenCalled();
		});

		test('skips method entry when decorators array is missing for the key', () => {
			const commonDecorator = vi.fn();

			class Sample {
				method() {
					return true;
				}
			}
			ApplyToClass({
				common: { method: [commonDecorator] },
				method: { method: undefined },
			} as DecoratorsLookUp)(Sample);

			expect(commonDecorator).not.toHaveBeenCalled();
		});
	});

	describe(ApplyToProperty, () => {
		test('returns a no-op decorator when no property config is provided', () => {
			const decorate = ApplyToProperty({});

			expect(decorate({}, 'anyKey')).toBeUndefined();
		});

		test('applies property and common decorators to the target', () => {
			const propertyDecorator = vi.fn();
			const commonDecorator = vi.fn();
			const target = {};
			const key = 'prop';

			const decorate = ApplyToProperty({
				common: { property: [commonDecorator] },
				property: { prop: [propertyDecorator] },
			} as DecoratorsLookUp);
			decorate(target, key);

			expect(propertyDecorator).toHaveBeenCalledWith(
				target,
				key,
				undefined,
			);
			expect(commonDecorator).toHaveBeenCalledWith(
				target,
				key,
				undefined,
			);
		});

		test('skips when no decorators are configured for the key', () => {
			const commonDecorator = vi.fn();

			const decorate = ApplyToProperty({
				common: { property: [commonDecorator] },
				property: {},
			} as DecoratorsLookUp);
			decorate({}, 'missing');

			expect(commonDecorator).not.toHaveBeenCalled();
		});

		test('applies property decorators when no common config is provided', () => {
			const propertyDecorator = vi.fn();
			const target = {};
			const key = 'prop';

			const decorate = ApplyToProperty({
				property: { prop: [propertyDecorator] },
			} as DecoratorsLookUp);
			decorate(target, key);

			expect(propertyDecorator).toHaveBeenCalledWith(
				target,
				key,
				undefined,
			);
		});
	});
});
