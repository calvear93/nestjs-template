import { afterEach } from 'node:test';
import { mock } from 'vitest-mock-extended';
import {
	afterAll,
	beforeAll,
	describe,
	expect,
	test,
	vi,
	type MockInstance,
} from 'vitest';
import { type CanActivate, type ExecutionContext } from '@nestjs/common';
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
		const [guard, allow] = createSecurityGuard(MockGuard, 'test', false);

		const guarDecorate = guard();
		const allowDecorate = allow();
		guarDecorate(
			_mockDecoratedClass,
			'',
			mock<PropertyDescriptor>({ value: { name: '' } }),
		);
		allowDecorate(_mockDecoratedClass, 'key', {} as any);

		expect(_spyReflectDefineMetadata).not.toBeCalled();
	});

	test('when enabled and is a class instance, return guard and allow decorators', () => {
		const [guard, allow] = createSecurityGuard(MockGuard, 'test', true);

		const guarDecorate = guard();
		const allowDecorate = allow();

		guarDecorate(
			_mockDecoratedClass,
			'',
			mock<PropertyDescriptor>({ value: { name: '' } }),
		);
		allowDecorate(_mockDecoratedClass, 'key', {} as any);

		expect(_spyReflectDefineMetadata).toBeCalledTimes(3);
	});

	test('when enabled and is a fn, return guard and allow decorators', () => {
		const [guard] = createSecurityGuard(MockGuard, 'test', true);

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
