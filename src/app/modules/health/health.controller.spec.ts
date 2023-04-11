import { beforeAll, describe, expect, test } from 'vitest';
import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller.js';

describe(HealthController.name, () => {
	let _controller: HealthController;

	// hooks
	beforeAll(async () => {
		const module = await Test.createTestingModule({
			controllers: [HealthController],
		}).compile();

		_controller = module.get(HealthController);
	});

	// tests
	test('should be defined', () => {
		expect(_controller).toBeDefined();
	});

	test('should response ok', async () => {
		expect(await _controller.check()).toMatchObject({ status: 'ok' });
	});
});
