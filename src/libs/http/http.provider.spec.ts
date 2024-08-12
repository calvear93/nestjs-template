import { Test, type TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { HttpProvider } from './http.provider.ts';

describe(HttpProvider, () => {
	let _module: TestingModule;
	let _provider: HttpProvider;

	const _altToken = 'otherHttpClient';

	// hooks
	beforeAll(async () => {
		_module = await Test.createTestingModule({
			providers: [
				HttpProvider.register(),
				HttpProvider.register({ useToken: _altToken }),
			],
		}).compile();

		_provider = _module.get<HttpProvider>(HttpProvider);
	});

	afterAll(async () => {
		await _module.close();
	});

	// tests
	test('common http provider should be defined', () => {
		expect(_provider).toBeDefined();
	});

	test('alternative http provider should be defined and configured', () => {
		const altProvider = _module.get<HttpProvider>(_altToken);

		expect(altProvider).toBeDefined();
	});
});
