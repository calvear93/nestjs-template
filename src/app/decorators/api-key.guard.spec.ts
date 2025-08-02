import type { ExecutionContext } from '@nestjs/common';
import type { HttpArgumentsHost } from '@nestjs/common/interfaces/index.ts';
import { randomUUID } from 'node:crypto';
import { beforeAll, describe, expect, test, vi } from 'vitest';
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
});
