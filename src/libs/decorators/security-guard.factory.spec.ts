import { afterEach } from 'node:test';
import { type CanActivate } from '@nestjs/common';
import {
	type MockInstance,
	afterAll,
	beforeAll,
	describe,
	expect,
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

describe('security-guard.factory', () => {
	const _mockDecoratedClass = new MockDecoratedClass();
	let _spyReflectDefineMetadata: MockInstance;

	// hooks
	beforeAll(() => {
		_spyReflectDefineMetadata = vi.spyOn(Reflect, 'defineMetadata');
	});

	afterEach(() => {
		vi.resetAllMocks();
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

		expect(_spyReflectDefineMetadata).toHaveBeenCalledTimes(3);
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
});
