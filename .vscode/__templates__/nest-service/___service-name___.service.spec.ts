import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { Test, type TestingModule } from '@nestjs/testing';
import { ___ServiceName___Service } from './___service-name___.service.ts';

describe(___ServiceName___Service.name, () => {
	let _module: TestingModule;
	let _service: ___ServiceName___Service;

	// hooks
	beforeAll(async () => {
		_module = await Test.createTestingModule({
			providers: [___ServiceName___Service],
		}).compile();

		_service = _module.get<___ServiceName___Service>(
			___ServiceName___Service,
		);
	});

	afterAll(async () => {
		await _module.close();
	});

	// tests
	test('1 + 1 should sum 2', () => {
		expect(_service.sum(1, 1)).toBe(2);
	});
});
