import type {
	OpenAPIObject,
	SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import z from 'zod';

type JsonSchemaCustomization =
	| z.core.JSONSchemaMeta
	| (<Z extends z.core.$ZodTypes>(
			jsonSchema: z.core.JSONSchema.BaseSchema,
			zodSchema: Z,
	  ) => z.core.JSONSchemaMeta);
type JsonSchemaCustomizations = Record<string, JsonSchemaCustomization>;

// global JSON schema registry for OpenAPI
const registered: [name: string, jsonSchema: SchemaObject][] = [];

export const JsonSchemaCustomizations: {
	readonly formats: JsonSchemaCustomizations;
	readonly types: JsonSchemaCustomizations;
} = {
	formats: {
		regex: (_, { _zod: { def } }: any) => ({
			pattern: def.pattern?.toString(),
			type: 'string',
		}),
	},
	types: {
		void: {
			default: null,
			nullable: true,
			readOnly: true,
			type: 'null',
		},
		any: {
			nullable: true,
		},
		bigint: {
			format: 'int64',
			type: 'integer',
		},
		date: {
			format: 'date-time',
			type: 'string',
		},
		nan: {
			nullable: true,
			type: 'number',
		},
		never: {
			not: {},
			readOnly: true,
		},
		nullable: {
			nullable: true,
		},
		regex: {
			pattern: 'date-time',
			type: 'string',
		},
		symbol: {
			default: null,
			type: 'string',
		},
		undefined: {
			readOnly: true,
		},
		map: (_, { _zod: { def } }: any) => ({
			additionalProperties: def.valueType.def,
			type: 'object',
		}),
		set: (_, { _zod: { def } }: any) => ({
			items: def.valueType.def,
			type: 'object',
		}),
		tuple: ({ prefixItems }) => ({
			maxItems: prefixItems?.length,
			minItems: prefixItems?.length,
		}),
	},
};

type ToJSONSchemaParams = Parameters<typeof z.toJSONSchema>[1];

const getOrCall = (
	customization: JsonSchemaCustomization,
	jsonSchema: z.core.JSONSchema.BaseSchema,
	zodSchema: z.core.$ZodTypes,
) => {
	if (typeof customization === 'function') {
		return customization(jsonSchema, zodSchema);
	}
	return customization;
};

export const applyJsonSchemaCustomizations = (): ToJSONSchemaParams => {
	return {
		override: (context) => {
			const { format, type } = context.zodSchema._zod.def as any;

			// applies type customizations
			const customType = getOrCall(
				JsonSchemaCustomizations.types[type],
				context.jsonSchema,
				context.zodSchema,
			);
			if (customType) Object.assign(context.jsonSchema, customType);

			// applies format customizations
			const customFormat = getOrCall(
				JsonSchemaCustomizations.formats[format],
				context.jsonSchema,
				context.zodSchema,
			);
			if (customFormat) Object.assign(context.jsonSchema, customFormat);
		},
		unrepresentable: 'any',
	};
};

export const toJSONSchema = (schema: z.ZodTypeAny, schemaName?: string) => {
	const jsonSchema = z.toJSONSchema(
		schema,
		applyJsonSchemaCustomizations(),
	) as SchemaObject;

	// registers global JSON schema for OpenAPI only if schemaName is provided
	if (schemaName) registered.push([schemaName, jsonSchema]);

	return jsonSchema;
};

/**
 * Register Zod DTOs schemas to OpenApi Swagger document.
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
