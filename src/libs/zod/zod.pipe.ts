import { type ArgumentMetadata, type PipeTransform } from '@nestjs/common';
import { ZodSchemaException } from './exceptions/zod-schema.exception.ts';
import { isZodDto } from './zod-dto.ts';

/**
 * Validates Zod DTO schemas
 * on controller input.
 */
export class ZodValidationPipe implements PipeTransform {
	transform(value: unknown, { metatype }: ArgumentMetadata): unknown {
		if (isZodDto(metatype)) {
			const result = metatype.schema.safeParse(value);

			if (result.success) return result.data;

			throw new ZodSchemaException(result.error);
		}

		return value;
	}
}
