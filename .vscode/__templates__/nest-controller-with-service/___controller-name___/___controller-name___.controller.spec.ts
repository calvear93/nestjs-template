import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { Test, type TestingModule } from '@nestjs/testing';
import { ___ControllerName___Service } from './___controller-name___.service.ts';
import { ___ControllerName___Controller } from './___controller-name___.controller.ts';

describe(___ControllerName___Controller, () => {
	let _module: TestingModule;
	let _controller: ___ControllerName___Controller;

	// hooks
	beforeAll(async () => {
		_module = await Test.createTestingModule({
			controllers: [___ControllerName___Controller],
			providers: [___ControllerName___Service],
		}).compile();

		_controller = _module.get<___ControllerName___Controller>(
			___ControllerName___Controller,
		);

		// disables logger
		(_controller as any)._logger?.localInstance.setLogLevels?.([]);
	});

	afterAll(async () => {
		await _module.close();
	});

	// tests
	test('should be defined', () => {
		expect(_controller).toBeDefined();
	});
});
