import type { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import {
	type z,
	type ZodArray,
	type ZodMap,
	type ZodObject,
	type ZodRecord,
	type ZodSet,
	type ZodTuple,
	type ZodType,
} from 'zod';
import { toJSONSchema } from './json-schema-customizations.ts';

type ZodIterable = ZodArray | ZodSet | ZodTuple;
type ZodShape = ZodMap | ZodObject | ZodRecord;

export interface ZodDto<
	Z extends ZodType = ZodType,
	I = z.input<Z>,
	O = z.output<Z>,
> {
	new (input?: I): O;
	readonly _: any;
	readonly jsonSchema: SchemaObject;
	readonly schema: Z;
	readonly registerOpenApi: (name?: string) => void;
}

/**
 * Validates if the object is a Zod DTO.
 *
 * @param dto - object to validate.
 */
export const isZodDto = (dto: any): dto is ZodDto => {
	return !!dto.schema;
};

/**
 * Creates a DTO from Zod shape,
 * with schema and jsonSchema
 * static properties.
 *
 * @param schema - zod shape
 * @param schemaName - optional name for OpenAPI registration
 *
 * @example
 * ```ts
 *	// sample.dto.ts
 *	import { z } from 'zod';
 *	import { ZodObjectDto } from #libs/zod';
 *
 *	const SampleSchema = z.object({
 *		id: z.number(),
 *		name: z.string()
 *	});
 *
 *	export class SampleDto extends ZodObjectDto(SampleSchema, "Sample") {}
 *
 *	SampleDto.registerOpenApi();
 *
 *	// sample.controller.ts
 *	import { SampleDto } from './sample.dto.ts';
 *
 *	\@Controller('sample')
 *	export class SampleController {
 *		\@Post()
 *		\@ApiBody({ schema: SampleDto.jsonSchema })
 *		sample(\@Body() demo: SampleDto): any { ... }
 *	}
 *
 *	// sample.parser.ts
 *	import { SampleDto } from './sample.dto.ts';
 *
 *	export const parseSampleDto = (input: unknown) => {
 *		return SampleDto.schema.parse(input);
 *	}
 * ```
 */
export const ZodObjectDto = <Z extends ZodShape, I = z.input<Z>>(
	schema: Z,
	schemaName?: string,
) => {
	return class {
		constructor(input?: I) {
			if (input) Object.assign(this, schema.parse(input));
		}
		static readonly jsonSchema = toJSONSchema(schema, schemaName);
		static readonly schema = schema;
	} as ZodDto<Z, I>;
};

/**
 * Creates a DTO from Zod array, set or tuple,
 * with schema and jsonSchema
 * static properties.
 *
 * @param schema - zod types list
 * @param schemaName - optional name for OpenAPI registration
 *
 * @example
 * ```ts
 *	// sample.dto.ts
 *	import { z } from 'zod';
 *	import { ZodIterableDto } from '#libs/zod';
 *
 *	const SampleIterableSchema = z.array([
 *		z.number(),
 *		z.string()
 *	]);
 *
 *	export class SampleDtoIterable extends ZodIterableDto(
 *		SampleIterableSchema,
 *		"Sample Array"
 *	) {}
 *
 *	SampleDtoIterable.registerOpenApi();
 *
 *	// sample.controller.ts
 *	import { SampleDtoIterable } from './sample.dto.ts';
 *
 *	\@Controller('sample')
 *	export class SampleController {
 *		\@Post()
 *		\@ApiBody({ schema: SampleDtoIterable.jsonSchema })
 *		sample(\@Body() demo: SampleDtoIterable): any { ... }
 *	}
 *
 *	// sample.parser.ts
 *	import { SampleDtoIterable } from './sample.dto.ts';
 *
 *	export const parseSampleDtoIterable = (input: unknown) => {
 *		return SampleDtoIterable.schema.parse(input);
 *	}
 * ```
 */
export const ZodIterableDto = <Z extends ZodIterable, I = z.input<Z>>(
	schema: Z,
	schemaName?: string,
) => {
	return class extends Array {
		constructor(input?: I) {
			super();
			if (input) this.push(...schema.parse(input));
		}
		static readonly jsonSchema = toJSONSchema(schema, schemaName);
		static readonly schema = schema;
	} as unknown as ZodDto<Z, I>;
};
