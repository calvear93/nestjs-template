import { beforeAll, describe, expect, test } from 'vitest';
import { CryptoProvider } from './crypto.provider.ts';

describe(CryptoProvider, () => {
	let provider: CryptoProvider;

	// crypto config
	const alg = 'aes-256-cbc';
	const key = 'vomNEievqNGNuLkKzcWnUnmyaosDfTyf';
	const vector = 'KUoNpTcoJmawbJbe';

	// for encrypt/decrypt testing
	const phrases = [
		'This is an encrypted message',
		'Hello World',
		"I'm happy",
		'My phone is +56 9 6993 1233',
	];

	// hooks
	beforeAll(() => {
		provider = new CryptoProvider(key, vector, alg);
	});

	// tests
	test.each(phrases)('encrypt and decrypt "%s"', (phrase) => {
		const encrypted = provider.encrypt(phrase);
		const decrypted = provider.decrypt(encrypted);

		expect(phrase).not.toBe(encrypted);
		expect(phrase).toBe(decrypted);
	});

	test.each(phrases)('hash "%s"', (phrase) => {
		const hashed = provider.hash(phrase);

		expect(phrase).not.toBe(hashed);
	});

	test('random UUID generation', () => {
		const uuidOne = provider.uuid();
		const uuidTwo = provider.uuid();

		expect(uuidOne).not.toBe(uuidTwo);
	});
});
