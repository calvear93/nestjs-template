import {
	type OpenAPIObject,
	type ReferenceObject,
	type SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface.ts';
import {
	type AnyZodObject,
	type AnyZodTuple,
	type RawCreateParams,
	type ZodArray,
	type ZodObject,
	type ZodRawShape,
	type ZodTypeAny,
	z,
} from 'zod';
import { zodToJsonSchema } from './json-schema.factory.ts';

const registered: [name: string, jsonSchema: ReferenceObject | SchemaObject][] =
	[];

type InferTuple<Tuple extends [...ZodTypeAny[]]> = {
	[Index in keyof Tuple]: z.infer<Tuple[Index]>;
};
type InferArray<Arr extends [...ZodTypeAny[]]> = z.infer<Arr[0]>[];

/**
 * Creates a DTO from Zod shape,
 * with schema and jsonSchema
 * static properties.
 *
 * @param shape - zod shape
 * @param config - zod type config
 *
 * @example
 * ```ts
 *	// sample.dto.ts
 *	import { z } from 'zod';
 *	import { ZodDto } from #libs/zod';
 *
 *	export class SampleDto extends ZodDto({
 *		id: z.number(),
 *		name: z.string()
 *	}) {}
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
export const ZodDto = <
	S extends ZodRawShape,
	Z extends AnyZodObject = ZodObject<S>,
>(
	shape: S,
	config?: RawCreateParams,
): ZodObjectDto<Z> => {
	const schema = z.object(shape, config);

	return class {
		constructor(fields?: Partial<z.infer<Z>>) {
			if (fields) {
				Object.assign(this, schema.parse(fields));
			}
		}

		static registerOpenApi() {
			registered.push([this.name, this.jsonSchema]);
		}

		static readonly jsonSchema = zodToJsonSchema(schema);

		static readonly schema = schema as unknown as Z;
	};
};

/**
 * Creates a DTO from Zod array or tuple,
 * with schema and jsonSchema
 * static properties.
 *
 * @param items - zod types list
 * @param config - zod type config
 *
 * @example
 * ```ts
 *	// sample.dto.ts
 *	import { z } from 'zod';
 *	import { ZodIterableDto } from '@zod';
 *
 *	export class SampleDtoIterable extends ZodIterableDto([
 *		z.number(),
 *		z.string()
 *	]) {}
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
export const ZodIterableDto = <
	T extends [ZodTypeAny, ...ZodTypeAny[]],
	Z extends AnyZodTuple | ZodArray<ZodTypeAny> = T['length'] extends 1
		? ZodArray<z.ZodTypeAny>
		: AnyZodTuple,
	I = T['length'] extends 1 ? InferArray<T> : InferTuple<T>,
>(
	items: T,
	config?: RawCreateParams,
): ZodIterableDto<Z, I> => {
	const schema =
		items.length === 1 ? z.array(items[0], config) : z.tuple(items, config);

	return class extends Array {
		constructor(items?: I) {
			super();
			if (items) {
				this.push(...schema.parse(items));
			}
		}

		static registerOpenApi() {
			registered.push([this.name, this.jsonSchema]);
		}

		static readonly jsonSchema = zodToJsonSchema(schema);

		static readonly schema = schema as unknown as Z;
	};
};

/**
 * Register Zod DTOs schemas to
 * OpenApi Swagger document.
 *
 * @example
 * ```ts
 *	import { ... } from '...';
 *	import { registerDtoSchemas } from '@zod';
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

/**
 * Zod DTO base.
 */
export interface ZodDto<Z extends ZodTypeAny = ZodTypeAny> {
	readonly jsonSchema: SchemaObject;
	registerOpenApi: () => void;
	readonly schema: Z;
}

/**
 * Zod DTO from object/shape.
 */
export interface ZodObjectDto<Z extends ZodTypeAny = ZodTypeAny, T = z.infer<Z>>
	extends ZodDto<Z> {
	new (fields?: Partial<T>): T;
}

/**
 * Zod DTO from array/tuple.
 */
export interface ZodIterableDto<
	Z extends ZodTypeAny = ZodTypeAny,
	I = InferArray<any> | InferTuple<any>,
	T = I extends (infer A)[] ? A : I extends [...infer B] ? B : any[],
> extends ZodDto<Z> {
	new (items?: I): T[];
}
