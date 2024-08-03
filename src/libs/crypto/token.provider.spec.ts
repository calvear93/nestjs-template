import { Test } from '@nestjs/testing';
import { beforeAll, describe, expect, test } from 'vitest';
import { TokenProvider } from './token.provider.ts';

describe(TokenProvider, () => {
	let _provider: TokenProvider;
	const _jsonFixture = {
		id: 1,
		anyNest: { inner: true },
		list: ['a', 'b'],
		prop: 'a prop',
	};

	// hooks
	beforeAll(async () => {
		const module = await Test.createTestingModule({
			providers: [
				TokenProvider.register({
					algorithm: 'shake256',
					secret: 'secret',
				}),
			],
		}).compile();

		_provider = module.get<TokenProvider>(TokenProvider);
	});

	// tests
	test('creates a signed token from Json', () => {
		const token = _provider.token(_jsonFixture);

		const json = _provider.verify(token);

		expect(json).toStrictEqual(_jsonFixture);
	});

	test('content adulteration returns null', () => {
		const otherJsonSerialized = Buffer.from(
			JSON.stringify({ ..._jsonFixture, list: ['a'], prop: 'new prop' }),
		).toString('base64url');

		const token = _provider.token(_jsonFixture);
		const [, signature] = token.split('.');
		const newToken = `${otherJsonSerialized}.${signature}`;

		const json = _provider.verify(newToken);

		expect(json).toBeNull();
	});
});
