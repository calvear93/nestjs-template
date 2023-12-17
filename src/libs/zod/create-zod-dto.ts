import { z, type RawCreateParams, type ZodObject, type ZodRawShape } from 'zod';
import {
	type OpenAPIObject,
	type ReferenceObject,
	type SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface.ts';
import { zodToJsonSchema } from './json-schema.factory.ts';

const registered: [name: string, jsonSchema: SchemaObject | ReferenceObject][] =
	[];

/**
 * Creates a DTO from Zod schema,
 * with schema and jsonSchema
 * static properties.
 *
 * @param schema - zod schema
 * @param config - zod object config
 *
 * @example
 * ```ts
 *	// sample.dto.ts
 *	import { z } from 'zod';
 *	import { zodDto } from '@libs/zod';
 *
 *	export class SampleDto extends zodDto({
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
export const zodDto = <S extends ZodRawShape>(
	shape: S,
	config?: RawCreateParams,
): ZodDto<S> => {
	const schema = z.object(shape, config);

	return class {
		constructor(fields?: z.infer<ZodObject<S>>) {
			if (fields) {
				Object.assign(this, schema.parse(fields));
			}
		}

		static readonly schema = schema;

		static readonly jsonSchema = zodToJsonSchema(schema);

		static registerOpenApi() {
			registered.push([this.name, this.jsonSchema]);
		}
	} as ZodDto<S>;
};

/**
 * Register Zod DTOs schemas to
 * OpenApi Swagger document.
 *
 * @example
 * ```ts
 *	import { ... } from '...';
 *	import { registerDtoSchemas } from '@libs/zod';
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

export type ZodConstructor<T> = new (value?: Partial<T>) => T;

export interface ZodDto<S extends ZodRawShape = any>
	extends ZodConstructor<z.infer<ZodObject<S>>> {
	readonly schema: ZodObject<S>;
	readonly jsonSchema: SchemaObject;
	registerOpenApi: () => void;
}
