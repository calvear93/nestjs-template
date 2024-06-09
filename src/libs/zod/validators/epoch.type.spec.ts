import { describe, expect, test } from 'vitest';
import { epoch } from './epoch.type.ts';

describe('epoch ZOD validator', () => {
	const _validator = epoch();
	// tests
	test.each([
		'1709337600000',
		'/Date(1709337600000)/',
		'/Date(1009337600000)/',
		'/date(1209337600000)/',
	])('validates well formed "%s" epoch correctly', (epoch) => {
		expect(_validator.safeParse(epoch).success).toBe(true);
	});

	test.each([
		null,
		undefined,
		Number.NaN,
		'',
		'/Dat(1709337600000/',
		'/(1709337600000)/',
		'170933760X000',
		'/Date(1709337600000/',
		'/Date(NaN)/',
	])('validates bad formed "%s" epoch correctly', (epoch) => {
		expect(_validator.safeParse(epoch).success).toBe(false);
	});
});
