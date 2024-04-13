import { Test } from '@nestjs/testing';
import { beforeAll, describe, expect, test } from 'vitest';
import { SampleService } from '../services/sample.service.ts';
import { SampleController } from './sample.controller.ts';

describe(SampleController, () => {
	let _controller: SampleController;

	// hooks
	beforeAll(async () => {
		const module = await Test.createTestingModule({
			controllers: [SampleController],
			providers: [SampleService],
		}).compile();

		_controller = module.get(SampleController);
	});

	// tests
	test('should be defined', () => {
		expect(_controller).toBeDefined();
	});

	test('run() returns "Hello World"', () => {
		const expected = 'Hello World';

		expect(_controller.run()).toBe(expected);
	});

	test('sum() of 1 and 2 returns 3', () => {
		const [num1, num2] = [1, 2];
		const expected = num1 + num2;

		expect(_controller.sum(num1, num2)).toBe(expected);
	});
});
