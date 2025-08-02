import type { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import {
	type z,
	type ZodArray,
	type ZodMap,
	type ZodObject,
	type ZodRecord,
	type ZodSafeParseError,
	type ZodSafeParseSuccess,
	type ZodSet,
	type ZodTuple,
	type ZodType,
} from 'zod';
import { toJSONSchema } from './json-schema-customizations.ts';

type ZodIterable = ZodArray | ZodSet | ZodTuple;
type ZodShape = ZodMap | ZodObject | ZodRecord;

export interface ZodTypeDto<
	Z extends ZodType = ZodType,
	I = z.input<Z>,
	O = z.output<Z>,
> {
	new (input?: I): O;
	readonly jsonSchema: SchemaObject;
	readonly schema: Z;
	safeFrom(input: z.input<Z>): ZodSafeParseError<Z> | ZodSafeParseSuccess<O>;
}

/**
 * Validates if the object is a Zod DTO.
 * Checks if the provided object has a static `schema` property,
 * which indicates it was created using ZodDto or ZodIterableDto.
 *
 * @param dto - object to validate
 * @returns true if the object is a Zod DTO, false otherwise
 *
 * @example
 * ```ts
 * class UserDto extends ZodDto(z.object({ name: z.string() })) {}
 *
 * console.log(isZodDto(UserDto)); // true
 * console.log(isZodDto({})); // false
 * ```
 */
export const isZodDto = (dto: any): dto is ZodTypeDto => {
	return !!dto.schema;
};

/**
 * Creates a DTO class from a Zod schema for objects, maps, or records.
 *
 * @param schema - Zod schema (ZodObject, ZodMap, or ZodRecord)
 * @param schemaName - Optional name for OpenAPI schema registration
 * @returns DTO class constructor with validation capabilities
 *
 * @example
 * Basic usage:
 * ```ts
 * import { z } from 'zod';
 * import { ZodDto } from '#libs/zod';
 *
 * const UserSchema = z.object({
 *	id: z.number().positive(),
 *	name: z.string().min(1),
 *	email: z.string().email()
 * });
 *
 * export class UserDto extends ZodDto(UserSchema, "User") {}
 *
 * // Usage in controller
 * \@Controller('users')
 * export class UserController {
 *	\@Post()
 *	\@ApiBody({ schema: UserDto.jsonSchema })
 *	create(\@Body() userData: UserDto) {
 *		// userData is automatically validated and typed
 *		return { message: `Created user ${userData.name}` };
 *	}
 * }
 * ```
 *
 * @example
 * Safe validation:
 * ```ts
 * const user = new UserDto();
 * const error = user.safeFrom({ id: "invalid", name: "" });
 *
 * if (error) {
 *	console.log("Validation errors:", error.issues);
 * } else {
 *	console.log("User created successfully:", user);
 * }
 * ```
 */
export const ZodDto = <Z extends ZodShape, I = z.input<Z>>(
	schema: Z,
	schemaName?: string,
) => {
	return class {
		constructor(input?: I) {
			if (input) Object.assign(this, schema.parse(input));
		}

		static safeFrom(input: I) {
			const { data, error, success } = schema.safeParse(input);
			if (!success) return { error, success: false };

			const instance = Object.assign(new this(), data);
			return { data: instance, success: true };
		}

		static readonly jsonSchema = toJSONSchema(schema, schemaName);
		static readonly schema = schema;
	} as ZodTypeDto<Z, I>;
};

/**
 * Creates a DTO class from a Zod schema for iterable types (arrays, sets, tuples).
 *
 * @param schema - Zod iterable schema (ZodArray, ZodSet, or ZodTuple)
 * @param schemaName - Optional name for OpenAPI schema registration
 * @returns DTO class that extends Array with validation capabilities
 *
 * @example
 * Array DTO:
 * ```ts
 * import { z } from 'zod';
 * import { ZodIterableDto } from '#libs/zod';
 *
 * const NumbersSchema = z.array(z.number().positive());
 * export class NumbersDto extends ZodIterableDto(NumbersSchema, "Numbers") {}
 *
 * // Usage
 * const numbers = new NumbersDto([1, 2, 3, 4, 5]);
 * console.log(numbers[0]); // 1
 * console.log(numbers.length); // 5
 * ```
 *
 * @example
 * Tuple DTO:
 * ```ts
 * const CoordinateSchema = z.tuple([z.number(), z.number(), z.string().optional()]);
 * export class CoordinateDto extends ZodIterableDto(CoordinateSchema, "Coordinate") {}
 *
 * // Usage in controller
 * \@Controller('locations')
 * export class LocationController {
 *	\@Post('coordinates')
 *	\@ApiBody({ schema: CoordinateDto.jsonSchema })
 *	addCoordinate(\@Body() coord: CoordinateDto) {
 *		const [lat, lng, label] = coord;
 *		return { lat, lng, label };
 *	}
 * }
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

		static safeFrom(input: I) {
			const { data, error, success } = schema.safeParse(input);
			if (!success) return { error, success: false };

			const instance = new this();
			instance.push(...data);
			return { data: instance, success: true };
		}

		static readonly jsonSchema = toJSONSchema(schema, schemaName);
		static readonly schema = schema;
	} as unknown as ZodTypeDto<Z, I>;
};
