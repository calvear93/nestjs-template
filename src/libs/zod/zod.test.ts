import { z } from 'zod';
import { describe, expect, test } from 'vitest';
import { type OpenAPIObject } from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common';
import { ZodValidationPipe } from './zod.pipe.js';
import { createZodDto, registerDtoSchemas } from './create-zod-dto.js';

describe('zod', () => {
	// tests
	test('register DTO schemas', () => {
		const name = 'DemoSchema';
		const openApi = {} as OpenAPIObject;

		createZodDto(z.object({ id: z.number() }), name);
		registerDtoSchemas(openApi);

		const { components } = openApi;

		expect(components).toBeDefined();
		expect(components?.schemas?.[name]).toBeDefined();
	});

	describe('validation pipe', () => {
		const _pipe = new ZodValidationPipe();
		const _dto = createZodDto(
			z.object({
				number: z.number(),
				string: z.string(),
			}),
		);
		const metadata = { metatype: _dto } as any;

		test('parses correct input', () => {
			const input = { number: 1, string: 'str' };

			const result = _pipe.transform(input, metadata);

			expect(result).toStrictEqual(input);
		});

		test('throws BadRequestException on bad input', () => {
			const input = { id: 1 };

			expect(() => _pipe.transform(input, metadata)).toThrow(
				BadRequestException,
			);
		});

		test('when metatype is not ZodDTO input is bypassed', () => {
			const input = { id: 1 };

			const result = _pipe.transform(input, { metatype: {} } as any);

			expect(result).toStrictEqual(input);
		});
	});
});
