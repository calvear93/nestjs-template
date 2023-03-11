import { beforeAll, describe, expect, test } from 'vitest';
import { Test } from '@nestjs/testing';
import { SampleService } from './sample.service.js';

describe(SampleService.name, () => {
	let service: SampleService;

	// hooks
	beforeAll(async () => {
		const module = await Test.createTestingModule({
			providers: [SampleService],
		}).compile();

		service = module.get<SampleService>(SampleService);
	});

	// tests
	test('should be defined', () => {
		expect(service).toBeDefined();
	});

	test('should return Hello World', () => {
		expect(service.sample()).toBe('Hello World');
	});
});
