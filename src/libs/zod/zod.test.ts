/* eslint-disable perfectionist/sort-objects */
import { BadRequestException } from '@nestjs/common';
import { type OpenAPIObject } from '@nestjs/swagger';
import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import {
	applyJsonSchemaCustomizations,
	registerDtoOpenApiSchemas,
} from './json-schema-customizations.ts';
import { ZodDto, ZodIterableDto } from './zod-dto.ts';
import { ZodValidationPipe } from './zod.pipe.ts';

describe(ZodValidationPipe, () => {
	// tests
	test('register DTO schemas', () => {
		const openApi = {} as OpenAPIObject;

		class Dto extends ZodDto(z.object({ id: z.number() }), 'Dto') {}
		registerDtoOpenApiSchemas(openApi);

		const { components } = openApi;

		expect(components).toBeDefined();
		expect(components?.schemas?.[Dto.name]).toBeDefined();
	});

	test('DTO generates JSON schema', () => {
		const dto = ZodDto(
			z.object({
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
				coerceToBigint: z.coerce.bigint(),
				// literal
				tuna: z.literal('tuna'),
				twelve: z.literal(12),
				tru: z.literal(true),
				colors: z.literal(['red', 'green', 'blue']),
				// template literal
				templateLiteral: z.templateLiteral([
					'hello, ',
					z.string(),
					'!',
				]),
				// strings
				max: z.string().max(3),
				min: z.string().min(10),
				length: z.string().length(5),
				uppercase: z.string().uppercase(),
				lowercase: z.string().lowercase(),
				trim: z.string().trim(),
				email: z.email(),
				emailHtml5: z.email({ pattern: z.regexes.html5Email }),
				url: z.url(),
				emoji: z.emoji(),
				uuid: z.uuid(),
				cuid: z.cuid(),
				cuid2: z.cuid2(),
				ulid: z.ulid(),
				regex: z.string().regex(/[a-c]/u),
				includes: z.string().includes('hello'),
				startsWith: z.string().startsWith('a'),
				endsWith: z.string().endsWith('z'),
				ipv4: z.ipv4(), // ipv4
				ipv6: z.ipv6(), // ipv6
				multiple: z.email().max(12).default('test@test.cl'),
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
				// nan
				sym: z.symbol('symbol'),
				// dates
				datetime: z.date(),
				date: z.iso.date(),
				time: z.iso.time(),
				isoDatetime: z.iso.datetime({ offset: true }),
				duration: z.iso.duration(),
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
					z.object({
						status: z.literal('success'),
						data: z.string(),
					}),
					z.object({
						status: z.literal('failed'),
						message: z.string(),
					}),
				]),
				// records
				record: z.record(z.string(), z.number()),
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
				file: z.file().max(1_000_000).mime(['image/png', 'image/jpeg']),
			}),
		);

		expect(dto.jsonSchema).toBeDefined();
		expect(dto.jsonSchema).toMatchSnapshot();
	});

	test('object DTO parses values on instantiation', () => {
		class Dto extends ZodDto(z.object({ id: z.number() }), 'Dto') {}

		const dto = new Dto({ id: 1 });

		expect(dto.id).toBe(1);
	});

	test('iterable (array) DTO parses values on instantiation', () => {
		class DtoIterable extends ZodIterableDto(
			z.array(z.number()),
			'DtoIterable',
		) {}

		const dto = new DtoIterable([1]);

		expect(dto[0]).toBe(1);
	});

	test('iterable (tuple) DTO parses values on instantiation', () => {
		class DtoIterable extends ZodIterableDto(
			z.tuple([z.number(), z.boolean()]),
			'DtoIterable',
		) {}

		const dto = new DtoIterable([1, true]);

		expect(dto[0]).toBe(1);
		expect(dto[1]).toBe(true);
	});

	test('object DTO safeFrom returns parsed instance on valid input', () => {
		class Dto extends ZodDto(z.object({ id: z.number() })) {}

		const result = Dto.safeFrom({ id: 7 });

		expect(result.success).toBe(true);
		expect(result.data).toBeInstanceOf(Dto);
		expect(result.data).toStrictEqual(new Dto({ id: 7 }));
	});

	test('object DTO safeFrom returns the error on invalid input', () => {
		class Dto extends ZodDto(z.object({ id: z.number() })) {}

		const result = Dto.safeFrom({ id: 'bad' } as any);

		expect(result.success).toBe(false);
		expect(result.error).toBeDefined();
	});

	test('iterable DTO safeFrom returns parsed instance on valid input', () => {
		class DtoIterable extends ZodIterableDto(z.array(z.number())) {}

		const result = DtoIterable.safeFrom([1, 2, 3]);

		expect(result.success).toBe(true);
		expect(result.data).toBeInstanceOf(DtoIterable);
		expect([...(result.data as DtoIterable)]).toStrictEqual([1, 2, 3]);
	});

	test('iterable DTO safeFrom returns the error on invalid input', () => {
		class DtoIterable extends ZodIterableDto(z.array(z.number())) {}

		const result = DtoIterable.safeFrom(['not', 'numbers'] as any);

		expect(result.success).toBe(false);
		expect(result.error).toBeDefined();
	});

	test('registerDtoOpenApiSchemas preserves existing components and schemas', () => {
		const existing = { type: 'object' } as any;
		const openApi = {
			components: { schemas: { Existing: existing } },
		} as unknown as OpenAPIObject;

		registerDtoOpenApiSchemas(openApi);

		expect(openApi.components?.schemas?.Existing).toBe(existing);
	});

	describe('JSON schema customizations', () => {
		// helpers
		const runOverride = (def: object) => {
			const jsonSchema = {};
			applyJsonSchemaCustomizations()!.override!({
				jsonSchema,
				zodSchema: { _zod: { def } },
			} as any);
			return jsonSchema;
		};

		// tests
		test('regex format customization stringifies the pattern', () => {
			const result = runOverride({
				format: 'regex',
				pattern: /abc/u,
				type: 'string',
			});

			expect(result).toStrictEqual({ pattern: '/abc/u', type: 'string' });
		});

		test('regex type customization applies its default schema', () => {
			const result = runOverride({ type: 'regex' });

			expect(result).toStrictEqual({
				pattern: 'date-time',
				type: 'string',
			});
		});

		test('map type customization renders additionalProperties', () => {
			const valueType = { def: { type: 'string' } };
			const result = runOverride({ type: 'map', valueType });

			expect(result).toStrictEqual({
				additionalProperties: valueType.def,
				type: 'object',
			});
		});

		test('set type customization renders the items shape', () => {
			const valueType = { def: { type: 'number' } };
			const result = runOverride({ type: 'set', valueType });

			expect(result).toStrictEqual({
				items: valueType.def,
				type: 'object',
			});
		});
	});

	describe('validation pipe', () => {
		const _pipe = new ZodValidationPipe();
		const Dto = ZodDto(
			z.object({
				number: z.number(),
				string: z.string(),
			}),
		);
		const metadata = { metatype: Dto } as any;

		test('parses correct input', () => {
			const input = { number: 1, string: 'str' };
			const dto = new Dto(input);

			const result = _pipe.transform(input, metadata);

			expect(result).toStrictEqual(dto);
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
