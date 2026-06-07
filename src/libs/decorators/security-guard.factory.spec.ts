import { type CanActivate, type ExecutionContext } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
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
import {
	createSecurityGuard,
	type SecurityGuard,
} from './security-guard.factory.ts';

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

	test('wraps canActivate to inject stored args from execution context', () => {
		class WrappableGuard implements SecurityGuard {
			canActivate(
				_context: ExecutionContext,
				_shared: string,
				_extra: string,
			) {
				return true;
			}
		}
		const _spyCanActivate = vi.spyOn(
			WrappableGuard.prototype,
			'canActivate',
		);

		const [SecureWith] = createSecurityGuard(
			WrappableGuard,
			true,
			'shared' as string,
		);

		class TargetController {
			handler() {
				return 'ok';
			}
		}
		const descriptor = Object.getOwnPropertyDescriptor(
			TargetController.prototype,
			'handler',
		)!;
		SecureWith('extra')(TargetController.prototype, 'handler', descriptor);

		const handler = TargetController.prototype.handler;
		const context = {
			getHandler: () => handler,
		} as unknown as ExecutionContext;
		const result = new WrappableGuard().canActivate(context, '', '');

		expect(result).toBe(true);
		expect(_spyCanActivate).toHaveBeenCalledWith(
			context,
			'shared',
			'extra',
		);
	});

	test('applies the guard to every method when used as a class decorator', () => {
		class ClassGuard implements CanActivate {
			canActivate() {
				return true;
			}
		}
		const [SecureClass] = createSecurityGuard(ClassGuard, true);

		class TargetClass {
			action() {
				return 'ok';
			}
		}
		SecureClass()(TargetClass);

		const guards = Reflect.getMetadata(
			GUARDS_METADATA,
			TargetClass.prototype.action,
		);

		expect(guards).toContain(ClassGuard);
	});

	test('class decoration keeps method-level args and skips locked methods', () => {
		class CombinedGuard implements SecurityGuard {
			canActivate(_context: ExecutionContext, _arg: string) {
				return true;
			}
		}
		const [SecureCombined] = createSecurityGuard(CombinedGuard, true);

		class TargetWithBoth {
			decoratedMethod() {
				return 'decorated';
			}
			plainMethod() {
				return 'plain';
			}
		}
		const decoratedDescriptor = Object.getOwnPropertyDescriptor(
			TargetWithBoth.prototype,
			'decoratedMethod',
		)!;

		SecureCombined('method-arg')(
			TargetWithBoth.prototype,
			'decoratedMethod',
			decoratedDescriptor,
		);
		SecureCombined('class-arg')(TargetWithBoth);

		expect(
			Reflect.getMetadata(
				GUARDS_METADATA,
				TargetWithBoth.prototype.plainMethod,
			),
		).toContain(CombinedGuard);
	});

	test('wrap is skipped when canActivate is missing a method value', () => {
		class GetterGuard {
			get canActivate() {
				return () => true;
			}
		}

		expect(() =>
			createSecurityGuard(
				GetterGuard as unknown as typeof MockGuard,
				true,
			),
		).not.toThrow();
	});

	test('method decoration is a no-op when invoked without a descriptor', () => {
		const [SecureMethod] = createSecurityGuard(MockGuard, true);
		const decorate = SecureMethod() as PropertyDecorator;

		expect(() => decorate(_mockDecoratedClass, 'anyKey')).not.toThrow();
	});

	test('a guard class reused by two factories injects each factory args', () => {
		class SharedGuard implements SecurityGuard {
			canActivate(_context: ExecutionContext, _a: string, _b: string) {
				return true;
			}
		}
		const _spyCanActivate = vi.spyOn(SharedGuard.prototype, 'canActivate');

		// two independent factories over the SAME guard class
		const [SecureA] = createSecurityGuard(SharedGuard, true, 'a');
		const [SecureB] = createSecurityGuard(SharedGuard, true, 'b');

		class CtrlA {
			handler() {
				return 'a';
			}
		}
		class CtrlB {
			handler() {
				return 'b';
			}
		}
		const descriptorA = Object.getOwnPropertyDescriptor(
			CtrlA.prototype,
			'handler',
		)!;
		const descriptorB = Object.getOwnPropertyDescriptor(
			CtrlB.prototype,
			'handler',
		)!;
		SecureA('x')(CtrlA.prototype, 'handler', descriptorA);
		SecureB('y')(CtrlB.prototype, 'handler', descriptorB);

		const guard = new SharedGuard();

		guard.canActivate(
			{
				getHandler: () => CtrlA.prototype.handler,
			} as unknown as ExecutionContext,
			'',
			'',
		);
		expect(_spyCanActivate).toHaveBeenLastCalledWith(
			expect.anything(),
			'a',
			'x',
		);

		guard.canActivate(
			{
				getHandler: () => CtrlB.prototype.handler,
			} as unknown as ExecutionContext,
			'',
			'',
		);
		expect(_spyCanActivate).toHaveBeenLastCalledWith(
			expect.anything(),
			'b',
			'y',
		);
	});
});
