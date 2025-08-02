import { describe, expect, test } from 'vitest';
import { epoch } from './epoch.type.ts';

describe('epoch ZOD validator', () => {
	const _validator = epoch();
	const _validatorInSeconds = epoch({ seconds: true });

	// tests
	test.each([
		'1709337600000000',
		'/Date(1709337600000000)/',
		'/Date(1009337600000000)/',
		'/Date(1012487600001.256)/',
		'/date(1209337600000000)/',
	])('validates well formed "%s" epoch correctly', (epoch) => {
		expect(_validator.safeParse(epoch).success).toBe(true);
	});

	test.each([
		null,
		undefined,
		Number.NaN,
		'',
		'/Dat(1709337600000000/',
		'/(1709337600000000)/',
		'170933760X000000',
		'/Date(1709337600000000/',
		'/Date(NaN)/',
	])('validates bad formed "%s" epoch correctly', (epoch) => {
		expect(_validator.safeParse(epoch).success).toBe(false);
	});

	test('parsing from millis', () => {
		const date = new Date();
		const epoch = date.getTime().toString();

		const value = _validator.safeParse(epoch).data;

		expect(value).toStrictEqual(date);
	});

	test('parsing from seconds', () => {
		const date = new Date();
		const epoch = (date.getTime() / 1000).toString();

		const value = _validatorInSeconds.safeParse(epoch).data;

		expect(value).toStrictEqual(date);
	});
});
