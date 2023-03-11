import { beforeAll, describe, expect, test } from 'vitest';
import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller.js';

describe(HealthController.name, () => {
	let controller: HealthController;

	// hooks
	beforeAll(async () => {
		const module = await Test.createTestingModule({
			controllers: [HealthController],
		}).compile();

		controller = module.get<HealthController>(HealthController);
	});

	// tests
	test('should be defined', () => {
		expect(controller).toBeDefined();
	});

	test('should response ok', async () => {
		expect(await controller.check()).toMatchObject({ status: 'ok' });
	});
});
