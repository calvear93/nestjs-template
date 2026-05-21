import type { ExecutionContext } from '@nestjs/common';
import type { HttpArgumentsHost } from '@nestjs/common/interfaces/index.ts';
import { randomUUID } from 'node:crypto';
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { ApiKeyGuard } from './api-key.guard.ts';

describe(ApiKeyGuard, () => {
	const _headerName = 'ms-api-key';
	const _apiKey = randomUUID();
	const _mockCtxGetRequest = vi.fn();
	const _mockCtx = mock<ExecutionContext>({
		switchToHttp: () =>
			mock<HttpArgumentsHost>({
				getRequest: _mockCtxGetRequest,
			}),
	});
	let _guard: ApiKeyGuard;

	// hooks
	beforeAll(() => {
		_guard = new ApiKeyGuard();
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.resetModules();
	});

	// tests
	test('return true when api key is valid', () => {
		_mockCtxGetRequest.mockReturnValueOnce({
			headers: { [_headerName]: _apiKey },
		});

		const result = _guard.canActivate(_mockCtx, _headerName, _apiKey);

		expect(result).toBe(true);
	});

	test('return false when api key is not valid', () => {
		_mockCtxGetRequest.mockReturnValueOnce({
			headers: { [_headerName]: 'bad_api_key' },
		});

		const result = _guard.canActivate(_mockCtx, _headerName, _apiKey);

		expect(result).toBe(false);
	});

	test('module exposes SECURITY_API_SCHEMA with apiKey type', async () => {
		const { SECURITY_API_SCHEMA } = await import('./api-key.guard.ts');

		expect(SECURITY_API_SCHEMA).toStrictEqual({
			description: 'Security Api Key',
			in: 'header',
			name: process.env.SECURITY_HEADER_NAME,
			type: 'apiKey',
		});
	});

	test('ApiKey decorator is active when SECURITY_ENABLED is true and API_KEY is set', async () => {
		vi.stubEnv('SECURITY_ENABLED', 'true');
		vi.stubEnv('SECURITY_API_KEY', _apiKey);
		vi.stubEnv('SECURITY_HEADER_NAME', _headerName);

		const { AllowAnonymous, ApiKey } = await import('./api-key.guard.ts');

		expect(typeof ApiKey).toBe('function');
		expect(typeof AllowAnonymous).toBe('function');
		expect(ApiKey.name).not.toBe('disabled');
		expect(AllowAnonymous.name).not.toBe('disabled');
	});

	test('ApiKey decorator is disabled when SECURITY_ENABLED is true but API_KEY is missing', async () => {
		vi.stubEnv('SECURITY_ENABLED', 'true');
		vi.stubEnv('SECURITY_API_KEY', '');

		const { AllowAnonymous, ApiKey } = await import('./api-key.guard.ts');

		expect(ApiKey.name).toBe('disabled');
		expect(AllowAnonymous.name).toBe('disabled');
	});
});
