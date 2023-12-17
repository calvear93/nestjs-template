import {
	type ZodTypeAny,
	type ZodType,
	z,
	type ZodRawShape,
	type RawCreateParams,
} from 'zod';
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
 *
 * @example
 * ```ts
 *	// sample.dto.ts
 *	import { z } from 'zod';
 *	import { createZodDto } from '@libs/zod';
 *
 *	export class SampleDto extends createZodDto({
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
export const zodDto = <
	T extends ZodRawShape,
	S extends ZodType = ReturnType<typeof z.object<T>>,
>(
	shape: T,
	params?: RawCreateParams,
): ZodDto<S> => {
	const schema = z.object(shape, params) as any;
	const jsonSchema = zodToJsonSchema(schema);

	return class {
		static readonly schema = schema;

		static readonly jsonSchema = zodToJsonSchema(schema);

		static registerOpenApi() {
			registered.push([this.name, jsonSchema]);
		}
	};
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

export type Constructor<T, Arguments extends unknown[] = any[]> = new (
	...arguments_: Arguments
) => T;

export interface ZodDto<T extends ZodType = ZodTypeAny>
	extends Constructor<z.infer<T>> {
	readonly schema: T;
	readonly jsonSchema: SchemaObject;
	registerOpenApi: () => void;
}
