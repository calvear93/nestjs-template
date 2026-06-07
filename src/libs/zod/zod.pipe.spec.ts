import { type ArgumentMetadata } from '@nestjs/common';
import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import { ZodSchemaException } from './exceptions/zod-schema.exception.ts';
import { ZodDto } from './zod-dto.ts';
import { ZodValidationPipe } from './zod.pipe.ts';

describe(ZodValidationPipe, () => {
	const _pipe = new ZodValidationPipe();

	class UserDto extends ZodDto(
		z.object({ name: z.string().min(1) }),
		'User',
	) {}

	// tests
	test('passes the value through when metatype is undefined', () => {
		const meta = { metatype: undefined, type: 'param' } as ArgumentMetadata;

		expect(_pipe.transform('raw', meta)).toBe('raw');
	});

	test('passes the value through for non-ZodDto metatypes', () => {
		const meta = { metatype: String, type: 'param' } as ArgumentMetadata;

		expect(_pipe.transform('raw', meta)).toBe('raw');
	});

	test('validates and returns a ZodDto instance for valid input', () => {
		const meta = { metatype: UserDto, type: 'body' } as ArgumentMetadata;

		const result = _pipe.transform({ name: 'Ada' }, meta);

		expect(result).toBeInstanceOf(UserDto);
		expect((result as UserDto).name).toBe('Ada');
	});

	test('throws ZodSchemaException on invalid input', () => {
		const meta = { metatype: UserDto, type: 'body' } as ArgumentMetadata;

		expect(() => _pipe.transform({ name: '' }, meta)).toThrow(
			ZodSchemaException,
		);
	});
});
