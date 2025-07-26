import { BadRequestException } from '@nestjs/common';
import type { ZodError } from 'zod';

/**
 * Extends NestJS BadRequestException to provide structured error messages
 * from Zod validation failures.
 * Automatically formats Zod error issues into readable error messages.
 *
 * This exception is automatically thrown by ZodValidationPipe when
 * validation fails, so you typically don't need to instantiate it manually.
 *
 * @example
 * ```ts
 * // For a schema validation error, this might produce:
 * // [
 * //	"name: String must contain at least 1 character(s)",
 * //	"email: Invalid email",
 * //	"age: Expected number, received string"
 * // ]
 * ```
 */
export class ZodSchemaException extends BadRequestException {
	constructor(error: ZodError) {
		const errorMessage = error.issues.map(
			({ message, path }) => `${path.join('.')}: ${message}`,
		);

		super(errorMessage);
	}
}
