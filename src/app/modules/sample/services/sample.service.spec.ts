import { Test } from '@nestjs/testing';
import { beforeAll, describe, expect, test } from 'vitest';
import { SampleService } from './sample.service.ts';

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

	test('sample() should return Hello World', () => {
		expect(_service.sample()).toBe('Hello World');
	});
});
