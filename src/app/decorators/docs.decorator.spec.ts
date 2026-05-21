import type { DecoratorsLookUp } from '#libs/decorators';
import { afterEach, describe, expect, test, vi } from 'vitest';

describe('docs decorators', () => {
	// hooks
	afterEach(() => {
		vi.unstubAllEnvs();
		vi.resetModules();
	});

	// tests
	describe('when SWAGGER_UI is enabled', () => {
		test('ApplyControllerDocs applies class decorators to the target', async () => {
			vi.stubEnv('SWAGGER_UI', 'true');
			const { ApplyControllerDocs } = await import('./docs.decorator.ts');
			const classDecorator = vi.fn();

			class Sample {}
			ApplyControllerDocs({ class: [classDecorator] })(Sample);

			expect(classDecorator).toHaveBeenCalledWith(Sample);
		});

		test('ApplyDtoDocs applies property decorators to the target', async () => {
			vi.stubEnv('SWAGGER_UI', 'true');
			const { ApplyDtoDocs } = await import('./docs.decorator.ts');
			const propertyDecorator = vi.fn();
			const target = {};
			const key = 'prop';

			const decorate = ApplyDtoDocs({
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

	describe('when SWAGGER_UI is disabled', () => {
		test('ApplyControllerDocs returns a no-op decorator', async () => {
			vi.stubEnv('SWAGGER_UI', 'false');
			const { ApplyControllerDocs } = await import('./docs.decorator.ts');
			const classDecorator = vi.fn();

			class Sample {}
			const result = ApplyControllerDocs({ class: [classDecorator] })(
				Sample,
			);

			expect(result).toBeUndefined();
			expect(classDecorator).not.toHaveBeenCalled();
		});

		test('ApplyDtoDocs returns a no-op decorator', async () => {
			vi.stubEnv('SWAGGER_UI', 'false');
			const { ApplyDtoDocs } = await import('./docs.decorator.ts');
			const propertyDecorator = vi.fn();

			const decorate = ApplyDtoDocs({
				property: { prop: [propertyDecorator] },
			} as DecoratorsLookUp);
			const result = decorate({}, 'prop');

			expect(result).toBeUndefined();
			expect(propertyDecorator).not.toHaveBeenCalled();
		});
	});
});
