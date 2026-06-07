import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { Test, type TestingModule } from '@nestjs/testing';
import { ___RepositoryName___Repository } from './___repository-name___.repository.ts';

describe(___RepositoryName___Repository.name, () => {
	let _module: TestingModule;
	let _repository: ___RepositoryName___Repository;

	// hooks
	beforeAll(async () => {
		_module = await Test.createTestingModule({
			providers: [___RepositoryName___Repository.register()],
		}).compile();

		_repository = _module.get<___RepositoryName___Repository>(
			___RepositoryName___Repository,
		);
	});

	afterAll(async () => {
		await _module.close();
	});

	// tests
	test('should be defined', () => {
		expect(_repository).toBeDefined();
	});

	test('sample() return "Hello World"', () => {
		expect(_repository.sample()).toBe('Hello World');
	});
});
