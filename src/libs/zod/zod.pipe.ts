import {
	BadRequestException,
	type ArgumentMetadata,
	type PipeTransform,
} from '@nestjs/common';
import { type ZodDto } from './create-zod-dto';

const isZodDto = (dto: any): dto is ZodDto => {
	return !!dto.schema;
};

/**
 * Validates Zod DTO schemas
 * on controller input.
 */
export class ZodValidationPipe implements PipeTransform {
	public transform(value: unknown, { metatype }: ArgumentMetadata): unknown {
		if (isZodDto(metatype)) {
			const result = metatype.schema.safeParse(value);

			if (result.success) return result.data;

			const message = result.error.errors.map(
				({ path, message }) => `${path.join('.')}: ${message}`,
			);

			throw new BadRequestException(message);
		}

		return value;
	}
}
