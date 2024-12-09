import { BadRequestException } from '@nestjs/common';
import type { ZodError } from 'zod';

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
