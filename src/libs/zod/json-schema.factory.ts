import {
	z,
	type AnyZodObject,
	type ZodOptionalType,
	type ZodTypeAny,
} from 'zod';
import { type SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface.ts';

interface ParsingArgs<T> {
	zodRef: T;
	schema: SchemaObject;
}

const isOptional = (item: ZodTypeAny): item is ZodOptionalType<any> => {
	return (
		item.isOptional() ||
		item instanceof z.ZodDefault ||
		item instanceof z.ZodNever ||
		item._def.typeName === 'ZodDefault'
	);
};

const iterateZodObject = ({ zodRef }: ParsingArgs<AnyZodObject>) => {
	const keys = Object.keys(zodRef.shape) as string[];

	return Object.fromEntries(
		keys.map((key: string) => [key, zodToJsonSchema(zodRef.shape[key])]),
	);
};

const toObject = ({
	schema,
	zodRef,
}: ParsingArgs<z.ZodObject<any>>): SchemaObject => {
	schema.type = 'object';
	schema.properties = iterateZodObject({ schema, zodRef });

	const required = Object.keys(zodRef.shape).filter((key) => {
		const item = zodRef.shape[key];
		return !isOptional(item);
	}) as string[];

	if (required.length > 0) schema.required = required;

	return schema;
};

const toRecord = ({
	schema,
	zodRef,
}: ParsingArgs<z.ZodRecord>): SchemaObject => {
	schema.type = 'object';
	schema.additionalProperties =
		zodRef._def.valueType instanceof z.ZodUnknown
			? {}
			: zodToJsonSchema(zodRef._def.valueType);

	return schema;
};

const toBoolean = ({ schema }: ParsingArgs<z.ZodBoolean>): SchemaObject => {
	schema.type = 'boolean';

	return schema;
};

const toString = ({
	schema,
	zodRef,
}: ParsingArgs<z.ZodString>): SchemaObject => {
	schema.type = 'string';

	const { checks = [] } = zodRef._def;

	for (const item of checks) {
		switch (item.kind) {
			case 'ulid':
				schema.format = item.kind;
				schema.example = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
				break;
			case 'cuid':
				schema.format = item.kind;
				schema.example = 'cjld2cjxh0000qzrmn831i7rn';
				break;
			case 'cuid2':
				schema.format = item.kind;
				schema.example = 'tz4a98xxat96iws9zmbrgj3a';
				break;
			case 'url':
				schema.format = 'uri';
				schema.example = 'http://www.example.com/';
				break;
			case 'length':
				schema.minLength = item.value;
				schema.maxLength = item.value;
				break;
			case 'max':
				schema.maxLength = item.value;
				break;
			case 'min':
				schema.minLength = item.value;
				break;
			case 'regex':
				schema.pattern = item.regex.source;
				break;
			case 'datetime':
				schema.format = 'date-time';
				break;
			case 'ip':
				item.version ??= 'v4';
				schema.format = `ip${item.version}`;
				break;
			case 'emoji':
				schema.example = '😜';
				break;
			default:
				break;
		}
	}

	return schema;
};

const toLiteral = ({
	schema,
	zodRef,
}: ParsingArgs<z.ZodLiteral<ZodTypeAny>>): SchemaObject => {
	schema.type = typeof zodRef._def.value;
	schema.enum = [zodRef._def.value];

	return schema;
};

const toNumber = ({
	schema,
	zodRef,
}: ParsingArgs<z.ZodNumber>): SchemaObject => {
	schema.type = 'number';

	const { checks = [] } = zodRef._def;

	for (const item of checks) {
		switch (item.kind) {
			case 'max':
				schema.maximum = item.value;
				if (!item.inclusive) schema.exclusiveMaximum = true;
				break;
			case 'min':
				schema.minimum = item.value;
				if (!item.inclusive) schema.exclusiveMinimum = true;
				break;
			case 'int':
				schema.type = 'integer';
				break;
			case 'multipleOf':
				schema.multipleOf = item.value;
				break;
			default:
				break;
		}
	}

	return schema;
};

const toBigInt = ({ schema }: ParsingArgs<z.ZodBigInt>): SchemaObject => {
	schema.type = 'integer';
	schema.format = 'int64';

	return schema;
};

const toNaN = ({ schema }: ParsingArgs<z.ZodNumber>): SchemaObject => {
	schema.type = 'number';
	schema.nullable = true;
	schema.readOnly = true;
	schema.default = Number.NaN;

	return schema;
};

const toDate = ({ schema }: ParsingArgs<z.ZodDate>): SchemaObject => {
	schema.type = 'string';
	schema.format = 'date-time';

	return schema;
};

const toNull = ({ schema }: ParsingArgs<z.ZodNull>): SchemaObject => {
	schema.type = 'number';
	schema.format = 'null';
	schema.nullable = true;
	schema.default = null;

	return schema;
};

const toVoidOrNever = ({ schema }: ParsingArgs<z.ZodNever>): SchemaObject => {
	schema.readOnly = true;

	return schema;
};

const toArray = ({
	schema,
	zodRef,
}: ParsingArgs<z.ZodArray<ZodTypeAny>>): SchemaObject => {
	schema.type = 'array';
	schema.items = zodToJsonSchema(zodRef.element);

	if (zodRef._def.exactLength !== null) {
		schema.minItems = zodRef._def.exactLength.value;
		schema.maxItems = zodRef._def.exactLength.value;
	}

	if (zodRef._def.minLength !== null)
		schema.minItems = zodRef._def.minLength.value;
	if (zodRef._def.maxLength !== null)
		schema.maxItems = zodRef._def.maxLength.value;

	return schema;
};

const toTuple = <
	T extends [ZodTypeAny, ...ZodTypeAny[]],
	Rest extends ZodTypeAny | null,
>({
	schema,
	zodRef,
}: ParsingArgs<z.ZodTuple<T, Rest>>): SchemaObject => {
	schema.type = 'array';
	schema.items = {
		oneOf: zodRef._def.items.map((t) => zodToJsonSchema(t)),
	};
	schema.minItems = zodRef._def.items.length;
	schema.maxItems = zodRef._def.items.length;

	return schema;
};

const toEnum = ({
	schema,
	zodRef,
}: ParsingArgs<z.ZodEnum<never> | z.ZodNativeEnum<never>>): SchemaObject => {
	schema.type = typeof Object.values(zodRef._def.values)[0];
	schema.enum = Object.values(zodRef._def.values);

	return schema;
};

const toIntersection = ({
	schema,
	zodRef,
}: ParsingArgs<
	z.ZodIntersection<z.ZodTypeAny, z.ZodTypeAny>
>): SchemaObject => {
	schema.allOf = [
		zodToJsonSchema(zodRef._def.left),
		zodToJsonSchema(zodRef._def.right),
	];

	return schema;
};

const toUnion = ({
	schema,
	zodRef,
}: ParsingArgs<
	z.ZodUnion<[z.ZodTypeAny, ...z.ZodTypeAny[]]>
>): SchemaObject => {
	schema.oneOf = zodRef._def.options.map((s) => zodToJsonSchema(s));

	return schema;
};

const toDiscriminatedUnion = ({
	schema,
	zodRef,
}: ParsingArgs<
	z.ZodDiscriminatedUnion<string, z.ZodDiscriminatedUnionOption<string>[]>
>): SchemaObject => {
	schema.discriminator = {
		propertyName: zodRef._def.discriminator,
	};

	schema.oneOf = [...zodRef._def.options.values()].map((s) =>
		zodToJsonSchema(s),
	);

	return schema;
};

const toOptionalNullable = ({
	schema,
	zodRef,
}: ParsingArgs<
	z.ZodOptional<ZodTypeAny> | z.ZodNullable<ZodTypeAny>
>): SchemaObject => {
	return { ...schema, ...zodToJsonSchema(zodRef.unwrap()) };
};

const toDefault = ({
	schema,
	zodRef,
}: ParsingArgs<z.ZodDefault<ZodTypeAny>>): SchemaObject => {
	return {
		...schema,
		default: zodRef._def.defaultValue(),
		...zodToJsonSchema(zodRef._def.innerType),
	};
};

const toTransformer = ({
	schema,
	zodRef,
}: ParsingArgs<
	z.ZodTransformer<never> | z.ZodEffects<never>
>): SchemaObject => {
	return { ...schema, ...zodToJsonSchema(zodRef._def.schema) };
};

const catchAll = ({ schema }: ParsingArgs<ZodTypeAny>): SchemaObject => {
	return schema;
};

const PARSERS_LOOKUP = {
	ZodAny: catchAll,
	ZodArray: toArray,
	ZodBigInt: toBigInt,
	ZodBoolean: toBoolean,
	ZodDate: toDate,
	ZodDefault: toDefault,
	ZodDiscriminatedUnion: toDiscriminatedUnion,
	ZodEffects: toTransformer,
	ZodEnum: toEnum,
	ZodFunction: catchAll,
	ZodIntersection: toIntersection,
	ZodLazy: catchAll,
	ZodLiteral: toLiteral,
	ZodMap: catchAll,
	ZodNaN: toNaN,
	ZodNativeEnum: toEnum,
	ZodNever: toVoidOrNever,
	ZodNull: toNull,
	ZodNullable: toOptionalNullable,
	ZodNumber: toNumber,
	ZodObject: toObject,
	ZodOptional: toOptionalNullable,
	ZodPromise: catchAll,
	ZodRecord: toRecord,
	ZodString: toString,
	ZodTransformer: toTransformer,
	ZodTuple: toTuple,
	ZodUndefined: toVoidOrNever,
	ZodUnion: toUnion,
	ZodUnknown: catchAll,
	ZodVoid: toVoidOrNever,
};

const hasLookupParser = (key: string): key is keyof typeof PARSERS_LOOKUP => {
	return key in PARSERS_LOOKUP;
};

/**
 * Creates a JSON Schema from Zod schema.
 * @see https://github.com/anatine/zod-plugins
 *
 * @param zodRef - zod schema
 */
export function zodToJsonSchema(zodRef: ZodTypeAny): SchemaObject {
	const {
		_def: { typeName },
		description,
		isNullable,
	} = zodRef;

	const schema: SchemaObject = {};

	if (isNullable()) schema.nullable = true;
	if (description) schema.description = description;

	if (hasLookupParser(typeName)) {
		return PARSERS_LOOKUP[typeName]({
			schema,
			zodRef: zodRef as any,
		});
	}

	return schema;
}
