/* eslint-disable perfectionist/sort-objects */
import { z } from 'zod';
import { describe, expect, test } from 'vitest';
import { type OpenAPIObject } from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common';
import { ZodValidationPipe } from './zod.pipe.ts';
import { zodDto, registerDtoOpenApiSchemas } from './create-zod-dto.ts';

describe(ZodValidationPipe, () => {
	// tests
	test('register DTO schemas', () => {
		const openApi = {} as OpenAPIObject;

		class Dto extends zodDto({ id: z.number() }) {}
		Dto.registerOpenApi();
		registerDtoOpenApiSchemas(openApi);

		const { components } = openApi;

		expect(components).toBeDefined();
		expect(components?.schemas?.[Dto.name]).toBeDefined();
	});

	test('DTO generates JSON schema', () => {
		const dto = zodDto({
			// primitive values
			string: z.string(),
			number: z.number(),
			boolean: z.boolean(),
			// empty types
			undefined: z.undefined(),
			null: z.null(),
			void: z.void(),
			// allows any value
			any: z.any(),
			unknown: z.unknown(),
			// allows no values
			never: z.never(),
			// coercion
			coerceDate: z.coerce.date(),
			coerceToString: z.coerce.string(),
			coerceToBool: z.coerce.boolean(),
			// literal
			tuna: z.literal('tuna'),
			twelve: z.literal(12),
			tru: z.literal(true),
			// strings
			max: z.string().max(3),
			min: z.string().min(10),
			length: z.string().length(5),
			email: z.string().email(),
			url: z.string().url(),
			emoji: z.string().emoji(),
			uuid: z.string().uuid(),
			cuid: z.string().cuid(),
			cuid2: z.string().cuid2(),
			ulid: z.string().ulid(),
			regex: z.string().regex(/[a-c]/),
			includes: z.string().includes('hello'),
			startsWith: z.string().startsWith('a'),
			endsWith: z.string().endsWith('z'),
			ipv4: z.string().ip(), // ipv4
			ipv6: z.string().ip({ version: 'v6' }),
			multiple: z.string().email().max(12).default('test@test.cl'),
			// numbers
			gt: z.number().gt(5),
			gte: z.number().gte(5), // alias .min(5)
			lt: z.number().lt(5),
			lte: z.number().lte(5), // alias .max(5)
			int: z.number().int(),
			positive: z.number().positive(),
			nonnegative: z.number().nonnegative(),
			negative: z.number().negative(),
			nonpositive: z.number().nonpositive(),
			multipleOf: z.number().multipleOf(5),
			// nan
			nan: z.nan(),
			// dates
			datetime: z.string().datetime(), // iso 8601
			from: z.coerce.date().min(new Date('1900-01-01')),
			until: z.coerce.date().max(new Date()),
			// enum
			enum: z.enum(['Salmon', 'Tuna', 'Trout']),
			// default
			default: z.string().default('hello world'),
			// nullable, optionals
			optional: z.boolean().optional(),
			nullable: z.boolean().nullable(),
			nullish: z.boolean().nullish(),
			// objects
			object: z.object({
				id: z.number().positive(),
				name: z.string(),
			}),
			// arrays
			array: z.array(z.number()),
			arrayNonEmpty: z.array(z.number()).nonempty(),
			arrayOf5: z.array(z.number()).length(5),
			arrayFrom5: z.array(z.number()).min(5),
			// tuples
			tuple: z.tuple([z.string(), z.boolean()]),
			// union
			stringOrNumber: z.union([z.string(), z.number()]),
			numberOrBool: z.number().or(z.boolean()),
			discriminated: z.discriminatedUnion('status', [
				z.object({ status: z.literal('success'), data: z.string() }),
				z.object({ status: z.literal('failed'), message: z.string() }),
			]),
			// records
			record: z.record(z.number()),
			lookup: z.record(z.string().max(3), z.boolean()),
			// intersection
			intersection: z.intersection(
				z.object({
					name: z.string(),
				}),
				z.object({
					role: z.string(),
				}),
			),
		});

		expect(dto.jsonSchema).toBeDefined();
		expect(dto.jsonSchema).toMatchSnapshot();
	});

	describe('validation pipe', () => {
		const _pipe = new ZodValidationPipe();
		const _dto = zodDto({
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
