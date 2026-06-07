import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { Test, type TestingModule } from '@nestjs/testing';

describe('___TestName___', () => {
	let _module: TestingModule;

	// hooks
	beforeAll(async () => {
		_module = await Test.createTestingModule({
			controllers: [],
			imports: [],
			providers: [],
		}).compile();
	});

	afterAll(async () => {
		await _module.close();
	});

	// tests
	test('module to be defined', () => {
		expect(_module).toBeDefined();
	});
});
