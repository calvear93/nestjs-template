import { BadRequestException } from '@nestjs/common';
import type { ZodError } from 'zod';

/**
 * Custom exception for Zod schema validation errors.
 *
 * Extends NestJS BadRequestException to provide structured error messages
 * from Zod validation failures. Automatically formats Zod error issues
 * into readable error messages.
 *
 * Error message format: "field.path: error message"
 *
 * @example
 * ```ts
 * // For a schema validation error, this might produce:
 * // [
 * //   "name: String must contain at least 1 character(s)",
 * //   "email: Invalid email",
 * //   "age: Expected number, received string"
 * // ]
 * ```
 *
 * This exception is automatically thrown by ZodValidationPipe when
 * validation fails, so you typically don't need to instantiate it manually.
 */
export class ZodSchemaException extends BadRequestException {
	constructor(error: ZodError) {
		const errorMessage = error.issues.map(
			({ message, path }) => `${path.join('.')}: ${message}`,
		);

		super(errorMessage);
	}
}
