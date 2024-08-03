import { describe, expect, test } from 'vitest';
import {
	removeDiacritics,
	removeSpecialChars,
	toTitleCase,
} from './string.util.ts';

describe('string util', () => {
	// tests
	test.each([
		[null, null],
		['hello world', 'Hello World'],
		['mY hElLo WoRLD', 'My Hello World'],
		['ANY GUY', 'Any Guy'],
		['08iTSOK', '08itsok'],
	])('toTitleCase transforms "%s" to "%s"', (input, expected) => {
		expect(toTitleCase(input)).toBe(expected);
	});

	test.each([
		[null, null],
		['hello\t\rworld', 'hello world'],
		["I'm a Teapot\n", "I'm a Teapot"],
		['Mother Foca\r\n', 'Mother Foca'],
	])('removeSpecialChars cleans string "%s" to "%s"', (input, expected) => {
		expect(removeSpecialChars(input)).toBe(expected);
	});

	test.each([
		[null, null],
		['èlÿsíân', 'elysian'],
		["that's good", 'thats good'],
	])(
		'removeDiacritics removes diacritics from "%s" to "%s"',
		(input, expected) => {
			expect(removeDiacritics(input)).toBe(expected);
		},
	);
});
