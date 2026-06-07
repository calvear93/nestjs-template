import { beforeAll, describe, expect, test } from 'vitest';
import { ___ControllerName___Service } from './___controller-name___.service.ts';

describe(___ControllerName___Service.name, () => {
	let _service: ___ControllerName___Service;

	// hooks
	beforeAll(() => {
		_service = new ___ControllerName___Service();
	});

	test('sample() should return Hello World', () => {
		expect(_service.sample()).toBe('Hello World');
	});
});
