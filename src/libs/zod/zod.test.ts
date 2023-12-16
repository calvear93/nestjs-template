import { z } from 'zod';
import { describe, expect, test } from 'vitest';
import { type OpenAPIObject } from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common';
import { ZodValidationPipe } from './zod.pipe.ts';
import { createZodDto, registerDtoSchemas } from './create-zod-dto.ts';

describe(ZodValidationPipe, () => {
	// tests
	test('register DTO schemas', () => {
		const openApi = {} as OpenAPIObject;

		class Dto extends createZodDto({ id: z.number() }) {}
		Dto.register();
		registerDtoSchemas(openApi);

		const { components } = openApi;

		expect(components).toBeDefined();
		expect(components?.schemas?.[Dto.name]).toBeDefined();
	});

	test('DTO generates JSON schema', () => {
		const dto = createZodDto({
			arr: z.array(z.boolean()),
			bigInt: z.bigint(),
			bool: z.boolean().nullable(),
			date: z.date(),
			discriminatedUnion: z.discriminatedUnion('status', [
				z.object({ data: z.string(), status: z.literal('success') }),
				z.object({
					error: z.instanceof(Error),
					status: z.literal('failed'),
				}),
			]),
			email: z.string().email(),
			enum: z.enum(['1', '2', '3']),
			id: z.number().max(10).min(2).default(5),
			intersection: z.number().and(z.string()),
			nan: z.nan(),
			null: z.null(),
			record: z.record(z.string(), z.number()),
			str: z.string().max(10).min(2),
			tuple: z.tuple([z.number(), z.string()]),
			union: z.number().or(z.string()),
		});

		expect(dto.jsonSchema).toBeDefined();
	});

	describe('validation pipe', () => {
		const _pipe = new ZodValidationPipe();
		const _dto = createZodDto({
			number: z.number(),
			string: z.string(),
		});
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
