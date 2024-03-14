import type { ZodError } from 'zod';
import { BadRequestException } from '@nestjs/common';

/**
 * ZOD schema validation error.
 */
export class ZodSchemaException extends BadRequestException {
	constructor(error: ZodError) {
		const errorMessage = error.errors.map(
			({ message, path }) => `${path.join('.')}: ${message}`,
		);

		super(errorMessage);
	}
}
