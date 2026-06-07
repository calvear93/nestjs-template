import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { Test, type TestingModule } from '@nestjs/testing';
import { ___ProviderName___Provider } from './___provider-name___.provider.ts';

describe(___ProviderName___Provider.name, () => {
	let _module: TestingModule;
	let _provider: ___ProviderName___Provider;

	// hooks
	beforeAll(async () => {
		_module = await Test.createTestingModule({
			providers: [___ProviderName___Provider.register(2)],
		}).compile();

		_provider = _module.get<___ProviderName___Provider>(
			___ProviderName___Provider,
		);
	});

	afterAll(async () => {
		await _module.close();
	});

	// tests
	test('should be defined', () => {
		expect(_provider).toBeDefined();
	});

	test('3 should result 6', () => {
		expect(_provider.multiply(3)).toBe(6);
	});
});
