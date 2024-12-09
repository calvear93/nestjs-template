import { type CanActivate } from '@nestjs/common';
import { afterEach } from 'node:test';
import {
	afterAll,
	beforeAll,
	describe,
	expect,
	type MockInstance,
	test,
	vi,
} from 'vitest';
import { mock } from 'vitest-mock-extended';
import { createSecurityGuard } from './security-guard.factory.ts';

class MockDecoratedClass {
	method() {
		return true;
	}
}

class MockGuard implements CanActivate {
	canActivate(): boolean {
		return true;
	}
}

describe('Security Guard Factory', () => {
	const _mockDecoratedClass = new MockDecoratedClass();
	let _spyReflectDefineMetadata: MockInstance;

	// hooks
	beforeAll(() => {
		_spyReflectDefineMetadata = vi.spyOn(Reflect, 'defineMetadata');
	});

	afterEach(() => {
		vi.resetAllMocks();
		vi.clearAllMocks();
	});

	afterAll(() => {
		vi.clearAllMocks();
	});

	// tests
	test('when not enabled, return void decorators', () => {
		const [guard, allow] = createSecurityGuard(MockGuard, false);

		const guarDecorate = guard();
		const allowDecorate = allow();
		guarDecorate(
			_mockDecoratedClass,
			'',
			mock<PropertyDescriptor>({ value: { name: '' } }),
		);
		allowDecorate(_mockDecoratedClass, 'key', {} as any);

		expect(_spyReflectDefineMetadata).not.toHaveBeenCalled();
	});

	test('when enabled and is a class instance, return guard and allow decorators', () => {
		const [guard, allow] = createSecurityGuard(MockGuard, true);

		const guarDecorate = guard();
		const allowDecorate = allow();

		guarDecorate(
			_mockDecoratedClass,
			'',
			mock<PropertyDescriptor>({ value: { name: '' } }),
		);
		allowDecorate(_mockDecoratedClass, 'key', {} as any);

		expect(_spyReflectDefineMetadata).toHaveBeenCalledTimes(4);
	});

	test('when enabled and is a fn, return guard and allow decorators', () => {
		const [guard] = createSecurityGuard(MockGuard, true);

		const guarDecorate = guard();
		_mockDecoratedClass.method.prototype = _mockDecoratedClass;

		guarDecorate(
			_mockDecoratedClass.method,
			'',
			mock<PropertyDescriptor>({ value: { name: '' } }),
		);

		expect(_spyReflectDefineMetadata).toBeDefined();
	});

	test('calls canActivate when enabled', () => {
		const [guard, allow] = createSecurityGuard(MockGuard, true);
		const _mockCanActivate = vi.fn();
		const _mockClass = class {
			canActivate = _mockCanActivate;
		};

		const guarDecorate = guard();
		const allowDecorate = allow();

		guarDecorate(
			class {
				canActivate = _mockCanActivate;
			},
			'',
			mock<PropertyDescriptor>({ value: { name: '' } }),
		);
		allowDecorate(_mockDecoratedClass, 'key', {} as any);

		const instance = new _mockClass();
		instance.canActivate();

		expect(_mockCanActivate).toHaveBeenCalled();
		expect(_spyReflectDefineMetadata).toHaveBeenCalledTimes(6);
	});
});
