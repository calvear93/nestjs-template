import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import { standardSchemaConverter } from './openapi.ts';

describe('standardSchemaConverter', () => {
	// tests

	test('registers a named, reusable component for a schema with .meta({ id })', () => {
		const schema = z
			.object({ id: z.coerce.number(), name: z.string() })
			.meta({ id: 'ConverterSample' });

		const result = standardSchemaConverter!(schema, {
			schemaType: 'output',
		});

		expect(result?.schema).toStrictEqual({
			$ref: '#/components/schemas/ConverterSample',
		});
		expect(result?.components?.ConverterSample).toMatchObject({
			type: 'object',
		});
	});

	test('a z.compile() clone of a .meta({ id }) base registers the component and refs it via allOf', () => {
		// this template's canonical form: `.meta({ id })` on the `_`-prefixed
		// base, then `z.compile()` — keeps the compiled fast path AND the named
		// component. `zod-openapi` emits the reference wrapped in a single-element
		// `allOf` (valid OpenAPI 3.0, identical in Swagger UI) rather than a bare
		// `$ref`; the component body itself is unchanged.
		const schema = z.compile(
			z
				.object({ id: z.coerce.number(), name: z.string() })
				.meta({ id: 'CompiledSample' }),
		);

		const result = standardSchemaConverter!(schema, {
			schemaType: 'output',
		});

		expect(result?.schema).toStrictEqual({
			allOf: [{ $ref: '#/components/schemas/CompiledSample' }],
		});
		expect(result?.components?.CompiledSample).toMatchObject({
			type: 'object',
		});
	});

	test('renders a schema without .meta({ id }) inline, with no components', () => {
		const schema = z.object({ id: z.coerce.number() });

		const result = standardSchemaConverter!(schema, {
			schemaType: 'output',
		});

		expect(result?.schema).toMatchObject({ type: 'object' });
		expect(result?.components).toStrictEqual({});
	});

	test('.omit()/.partial() derivations do not inherit the base schema id', () => {
		const base = z
			.object({ id: z.coerce.number(), name: z.string() })
			.meta({ id: 'BaseSample' });
		const derived = base.omit({ id: true });

		const result = standardSchemaConverter!(derived, {
			schemaType: 'input',
		});

		// renders inline, not as a $ref to a registered component — a derived
		// schema needs its own .meta({ id }) to register separately
		expect(result?.schema).toMatchObject({ type: 'object' });
		expect(result?.components).toStrictEqual({});
	});

	// zod 4's native toJSONSchema() treats these as "unrepresentable": without
	// an override, generating the OpenAPI document throws instead of just
	// producing an imprecise schema — so this is a regression test, not just
	// a shape check.
	describe('types unrepresentable by Zod/zod-openapi without an override', () => {
		test('z.void()', () => {
			const result = standardSchemaConverter!(z.void(), {
				schemaType: 'output',
			});

			expect(result?.schema).toStrictEqual({
				nullable: true,
				type: 'null',
			});
		});

		test('z.nan()', () => {
			const result = standardSchemaConverter!(z.nan(), {
				schemaType: 'output',
			});

			expect(result?.schema).toStrictEqual({
				nullable: true,
				type: 'number',
			});
		});

		test('z.symbol()', () => {
			const result = standardSchemaConverter!(z.symbol(), {
				schemaType: 'output',
			});

			expect(result?.schema).toStrictEqual({ type: 'string' });
		});

		test('z.map() recursively converts its value type into additionalProperties', () => {
			const result = standardSchemaConverter!(
				z.map(z.string(), z.number()),
				{ schemaType: 'output' },
			);

			expect(result?.schema).toStrictEqual({
				additionalProperties: { type: 'number' },
				type: 'object',
			});
		});

		test('z.set() recursively converts its value type into items, and is unique', () => {
			const result = standardSchemaConverter!(z.set(z.string()), {
				schemaType: 'output',
			});

			expect(result?.schema).toStrictEqual({
				items: { type: 'string' },
				type: 'array',
				uniqueItems: true,
			});
		});
	});

	test('z.custom()/z.function() render as an open schema instead of throwing', () => {
		const custom = standardSchemaConverter!(z.custom<string>(), {
			schemaType: 'output',
		});
		const fn = standardSchemaConverter!(z.function(), {
			schemaType: 'output',
		});

		expect(custom?.schema).toStrictEqual({});
		expect(fn?.schema).toStrictEqual({});
	});

	test('z.date() renders with a date-time format hint', () => {
		const result = standardSchemaConverter!(z.date(), {
			schemaType: 'output',
		});

		expect(result?.schema).toMatchObject({
			format: 'date-time',
			type: 'string',
		});
	});

	// each call NestJS makes to the converter (one per io context — see the
	// request/response split in app.ts's addSwagger) builds its own private
	// component registry, so registering the SAME id from two independent
	// calls collides under last-write-wins rather than zod-openapi's
	// automatic outputId-suffix renaming (that only applies within a single
	// createDocument()/createSchemas() batch call, which this app never uses)
	describe('the same schema registered from two independent converter calls', () => {
		test('without an explicit outputId, both calls register the same component name and the later call wins', () => {
			const schema = z
				.object({ id: z.coerce.number() })
				.meta({ id: 'DualContext' });

			const input = standardSchemaConverter!(schema, {
				schemaType: 'input',
			});
			const output = standardSchemaConverter!(schema, {
				schemaType: 'output',
			});

			expect(Object.keys(input?.components ?? {})).toStrictEqual([
				'DualContext',
			]);
			expect(Object.keys(output?.components ?? {})).toStrictEqual([
				'DualContext',
			]);
			// the output shape (additionalProperties: false) is what a
			// caller merging both calls' components into one document ends
			// up with, since it's whichever call ran last
			expect(input?.components?.DualContext).not.toStrictEqual(
				output?.components?.DualContext,
			);
		});

		test('an explicit outputId does NOT produce a distinct component name across independent calls', () => {
			const schema = z
				.object({ id: z.coerce.number() })
				.meta({ id: 'WithOutputId', outputId: 'WithOutputIdResponse' });

			const input = standardSchemaConverter!(schema, {
				schemaType: 'input',
			});
			const output = standardSchemaConverter!(schema, {
				schemaType: 'output',
			});

			// still both register under the base `id`, NOT under `outputId` —
			// the outputId-rename mechanism needs both contexts processed in
			// the same createDocument()/createSchemas() batch call to see that
			// the id is shared between an input and an output usage; each of
			// our two standalone createSchema() calls only ever sees ONE side
			expect(Object.keys(input?.components ?? {})).toStrictEqual([
				'WithOutputId',
			]);
			expect(Object.keys(output?.components ?? {})).toStrictEqual([
				'WithOutputId',
			]);
		});
	});
});
