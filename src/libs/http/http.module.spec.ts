import { Test, type TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { HttpClient } from './http.client.ts';
import { HttpModule } from './http.module.ts';

describe(HttpModule, () => {
	let _module: TestingModule;
	let _client: HttpClient;

	const _altToken = 'otherHttpClient';

	// hooks
	beforeAll(async () => {
		_module = await Test.createTestingModule({
			imports: [
				HttpModule.register(),
				HttpModule.register({ useToken: _altToken }),
			],
		}).compile();

		_client = _module.get<HttpClient>(HttpClient);
	});

	afterAll(async () => {
		await _module.close();
	});

	// tests
	test('common http provider should be defined', () => {
		expect(_client).toBeDefined();
	});

	test('alternative http provider should be defined and configured', () => {
		const altProvider = _module.get<HttpClient>(_altToken);

		expect(altProvider).toBeDefined();
	});
});
