import { describe, expect, test } from 'vitest';
import { phone } from './phone.type.ts';

describe('phone ZOD validator', () => {
	const _validator = phone();
	// tests
	test.each([
		'+56 9 9264 1781',
		'+56 9 92641781',
		'+56992641781',
		'992641781',
		'+919367788755',
		'8989829304',
		'+16308520397',
		'786-307-3615',
	])('validates well formed "%s" phone correctly', (phone) => {
		expect(_validator.safeParse(phone).success).toBe(true);
	});

	test.each(['56 9 9264', '789', '123765', '1-1-1', '+982'])(
		'validates bad formed "%s" phone correctly',
		(phone) => {
			expect(_validator.safeParse(phone).success).toBe(false);
		},
	);
});
