import { type ArgumentMetadata, type PipeTransform } from '@nestjs/common';
import { ZodSchemaException } from './exceptions/zod-schema.exception.ts';
import { isZodDto } from './zod-dto.ts';

/**
 * NestJS validation pipe for Zod DTOs.
 * Automatically validates and transforms incoming data using Zod schemas
 * when the parameter type is a ZodDto or ZodIterableDto class.
 *
 * @example
 * Global usage:
 * ```ts
 * // main.ts
 * import { ZodValidationPipe } from '#libs/zod';
 *
 * const app = await NestFactory.create(AppModule);
 * app.useGlobalPipes(new ZodValidationPipe());
 * ```
 *
 * @example
 * Controller-level usage:
 * ```ts
 * import { ZodValidationPipe } from '#libs/zod';
 *
 * \@Controller('users')
 * \@UsePipes(ZodValidationPipe)
 * export class UserController {
 *	\@Post()
 *	create(\@Body() userData: UserDto) {
 *		// userData is automatically validated
 *	}
 * }
 * ```
 *
 * @example
 * Method-level usage:
 * ```ts
 * \@Post()
 * \@UsePipes(ZodValidationPipe)
 * create(\@Body() userData: UserDto) {
 *	// Only this method uses Zod validation
 * }
 * ```
 */
export class ZodValidationPipe implements PipeTransform {
	transform(
		value: unknown,
		{ metatype: ZodTypeDto }: ArgumentMetadata,
	): unknown {
		if (isZodDto(ZodTypeDto)) {
			const { data, error, success } = ZodTypeDto.safeFrom(value);

			if (!success) throw new ZodSchemaException(error);

			return data;
		}

		// if no ZodDto, bypasses
		return value;
	}
}
