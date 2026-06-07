import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ___UseCaseName___UseCase } from './___use-case-name___.use-case.js';

describe(___UseCaseName___UseCase.name, () => {
	let _module: TestingModule;
	let _useCase: ___UseCaseName___UseCase;

	// hooks
	beforeAll(async () => {
		_module = await Test.createTestingModule({
			providers: [___UseCaseName___UseCase],
		}).compile();

		_useCase = _module.get<___UseCaseName___UseCase>(
			___UseCaseName___UseCase,
		);
	});

	afterAll(async () => {
		await _module.close();
	});

	// tests
	test('1 + 1 should sum 2', () => {
		expect(_useCase.sum(1, 1)).toBe(2);
	});
});
