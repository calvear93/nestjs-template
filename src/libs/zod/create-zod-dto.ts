import { type ZodTypeAny, type ZodType, type z } from 'zod';
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
 *	const SampleSchema = z.object({ id: z.number(), name: z.string() });
 *
 *	export class SampleDto extends createZodDto(SampleSchema) {}
 *	SampleDto.register();
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
export const createZodDto = <T extends ZodType>(
	schema: T,
): ZodDto<z.infer<T>, T> => {
	const jsonSchema = zodToJsonSchema(schema);

	return class {
		static readonly schema = schema;

		static register() {
			registered.push([this.name, jsonSchema]);
		}

		static get jsonSchema() {
			return jsonSchema;
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
export const registerDtoSchemas = (openApi: OpenAPIObject): OpenAPIObject => {
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

export interface ZodDto<T = any, S extends ZodType = ZodTypeAny>
	extends Constructor<T> {
	readonly schema: S;
	register: () => void;
	get jsonSchema(): SchemaObject;
}
