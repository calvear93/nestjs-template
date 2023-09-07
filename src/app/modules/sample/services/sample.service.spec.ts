import { beforeAll, describe, expect, test } from 'vitest';
import { Test } from '@nestjs/testing';
import { SampleService } from './sample.service.js';

describe(SampleService, () => {
	let _service: SampleService;

	// hooks
	beforeAll(async () => {
		const module = await Test.createTestingModule({
			providers: [SampleService],
		}).compile();

		_service = module.get(SampleService);
	});

	// tests
	test('should be defined', () => {
		expect(_service).toBeDefined();
	});

	test('should return Hello World', () => {
		expect(_service.sample()).toBe('Hello World');
	});
});
