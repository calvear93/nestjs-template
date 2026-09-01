import type { SwaggerDocumentOptions } from '@nestjs/swagger';
import { createSchema, type ZodOpenApiOverride } from 'zod-openapi';
import type { $ZodMapDef, $ZodSetDef } from 'zod/v4/core';

const OPENAPI_VERSION = '3.0.0';

/**
 * Converts a nested Zod type (e.g. a map's value type) into a plain JSON
 * Schema fragment, for embedding inline in a parent's `additionalProperties`/
 * `items`. This is NOT `$ref`-aware: named-component registration only
 * happens through Zod's internal registry plumbing (the same mechanism
 * `zod-openapi`'s array/object handling relies on), which isn't reachable
 * from this `override` hook — so a nested type with its own `.meta({ id })`
 * still gets inlined here instead of extracted into its own component.
 */
const toInlineSchema = (zodType: unknown, io: 'input' | 'output') =>
	createSchema(zodType as never, { io, openapiVersion: OPENAPI_VERSION })
		.schema;

/**
 * Type-level quirks Zod 4's native `toJSONSchema()` (which `zod-openapi`
 * wraps) treats as "unrepresentable" and `zod-openapi` doesn't patch itself:
 * `void`/`nan`/`symbol`/`map`/`set` throw an `Error` at
 * `SwaggerModule.createDocument()` time unless given *some* JSON Schema
 * shape first, and `z.date()` renders as a bare `{ type: 'string' }` without
 * a `date-time` format hint. This restores the same representations the
 * template's old, now-removed `json-schema-customizations.ts` produced —
 * only the type table, not its DTO/registry machinery. `map`/`set` go
 * further than the old table: they recursively convert their value type
 * instead of a bare `{ type: 'object' }`/`{ type: 'array' }` stub (the old
 * table's equivalent, `def.valueType.def`, read one level too deep and
 * produced a raw internal Zod definition instead of a schema).
 */
const applyTypeOverrides: ZodOpenApiOverride = (ctx) => {
	const def = ctx.zodSchema._zod.def;

	switch (def.type) {
		case 'void':
			Object.assign(ctx.jsonSchema, { nullable: true, type: 'null' });
			break;
		case 'nan':
			Object.assign(ctx.jsonSchema, { nullable: true, type: 'number' });
			break;
		case 'symbol':
			Object.assign(ctx.jsonSchema, { type: 'string' });
			break;
		case 'map': {
			const { valueType } = def as $ZodMapDef;
			Object.assign(ctx.jsonSchema, {
				additionalProperties: toInlineSchema(valueType, ctx.io),
				type: 'object',
			});
			break;
		}
		case 'set': {
			const { valueType } = def as $ZodSetDef;
			Object.assign(ctx.jsonSchema, {
				items: toInlineSchema(valueType, ctx.io),
				type: 'array',
				uniqueItems: true,
			});
			break;
		}
		case 'date':
			Object.assign(ctx.jsonSchema, { format: 'date-time' });
			break;
		default:
			break;
	}
};

/**
 * Wires Zod schemas passed to `@Body({ schema })`/`@Query({ schema })`/
 * `@Param({ schema })` into the OpenAPI document `SwaggerModule.createDocument`
 * generates, via NestJS's native Standard Schema support.
 */
export const standardSchemaConverter: SwaggerDocumentOptions['standardSchemaConverter'] =
	(schema, { schemaType }) => {
		const converted = createSchema(schema as never, {
			io: schemaType,
			openapiVersion: OPENAPI_VERSION,
			opts: {
				// `custom`/`function` schemas (and dynamic `catch` values) have no
				// generic JSON shape — without this they'd throw and take down the
				// whole document. An empty/permissive `{}` schema is a safe
				// fallback; authors can still opt into a precise shape via `.meta()`.
				allowEmptySchema: { custom: true, function: true },
				override: applyTypeOverrides,
			},
		});

		return { components: converted.components, schema: converted.schema };
	};
