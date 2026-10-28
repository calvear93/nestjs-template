import { describe, expect, test } from 'vitest';
import { corsFrom } from './cors.util.ts';

describe(corsFrom, () => {
	test('allows only the listed origins', () => {
		const cors = corsFrom('http://localhost:5173,https://app.example.com');

		expect(cors).toStrictEqual({
			origin: ['http://localhost:5173', 'https://app.example.com'],
		});
	});

	test('trims spaces and drops empty entries', () => {
		const cors = corsFrom(
			' http://localhost:5173 , ,https://app.example.com, ',
		);

		expect(cors).toStrictEqual({
			origin: ['http://localhost:5173', 'https://app.example.com'],
		});
	});

	test('turns CORS off when the list is empty or missing', () => {
		expect(corsFrom('')).toBe(false);
		expect(corsFrom(' , ')).toBe(false);
		expect(corsFrom()).toBe(false);
	});
});
