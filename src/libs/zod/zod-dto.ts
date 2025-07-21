import type {
	OpenAPIObject,
	SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import {
	z,
	type ZodArray,
	type ZodMap,
	type ZodObject,
	type ZodRecord,
	type ZodSet,
	type ZodTuple,
	type ZodType,
} from 'zod';
import { applyJsonSchemaCustomizations } from './json-schema-customizations.ts';

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

export const isZodDto = (dto: any): dto is ZodDto => {
	return !!dto.schema;
};

// global JSON schema registry for OpenAPI
const registered: [name: string, jsonSchema: SchemaObject][] = [];

/**
 * Creates a DTO from Zod shape,
 * with schema and jsonSchema
 * static properties.
 *
 * @param input - zod shape
 *
 * @example
 * ```ts
 *	// sample.dto.ts
 *	import { z } from 'zod';
 *	import { ZodDto } from #libs/zod';
 *
 *	const SampleSchema = z.object({
 *		id: z.number(),
 *		name: z.string()
 *	});
 *
 *	export class SampleDto extends ZodDto(SampleSchema) {}
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
export const ZodObjectDto = <Z extends ZodShape, I = z.input<Z>>(schema: Z) => {
	return class {
		constructor(input?: I) {
			if (input) Object.assign(this, schema.parse(input));
		}
		static registerOpenApi(name?: string) {
			registered.push([name ?? this.name, this.jsonSchema]);
		}
		static readonly jsonSchema = z.toJSONSchema(
			schema.meta({ openid: true }),
			applyJsonSchemaCustomizations(),
		) as SchemaObject;
		static readonly schema = schema;
	} as ZodDto<Z, I>;
};

/**
 * Creates a DTO from Zod array, set or tuple,
 * with schema and jsonSchema
 * static properties.
 *
 * @param input - zod types list
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
 *	export class SampleDtoIterable extends ZodIterableDto(SampleIterableSchema) {}
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
) => {
	return class extends Array {
		constructor(input?: I) {
			super();
			if (input) this.push(...schema.parse(input));
		}
		static registerOpenApi(name?: string) {
			registered.push([name ?? this.name, this.jsonSchema]);
		}
		static readonly jsonSchema = z.toJSONSchema(
			schema,
			applyJsonSchemaCustomizations(),
		) as SchemaObject;
		static readonly schema = schema;
	} as unknown as ZodDto<Z, I>;
};

/**
 * Register Zod DTOs schemas to
 * OpenApi Swagger document.
 *
 * @example
 * ```ts
 *	import { ... } from '...';
 *	import { registerDtoSchemas } from '#libs/zod';
 *
 *	const app = await NestFactory.create(AppModule);
 *
 *	const config = new DocumentBuilder().build();
 *	const document = SwaggerModule.createDocument(app, config);
 *
 *	registerDtoSchemas(document);
 * ```
 */
export const registerDtoOpenApiSchemas = (
	openApi: OpenAPIObject,
): OpenAPIObject => {
	openApi.components ??= {};
	openApi.components.schemas ??= {};

	for (const [name, schema] of registered) {
		openApi.components.schemas[name] = schema;
	}

	return openApi;
};
