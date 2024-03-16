import { randomUUID } from 'node:crypto';
import { mock } from 'vitest-mock-extended';
import { beforeAll, describe, expect, test, vi } from 'vitest';
import type { HttpArgumentsHost } from '@nestjs/common/interfaces/index.ts';
import type { ExecutionContext } from '@nestjs/common';
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
		_guard = new ApiKeyGuard(_headerName, _apiKey);
	});

	// tests
	test('return true when api key is valid', () => {
		_mockCtxGetRequest.mockReturnValueOnce({
			headers: { [_headerName]: _apiKey },
		});

		const result = _guard.canActivate(_mockCtx);

		expect(result).toBe(true);
	});

	test('return false when api key is not valid', () => {
		_mockCtxGetRequest.mockReturnValueOnce({
			headers: { [_headerName]: 'bad_api_key' },
		});

		const result = _guard.canActivate(_mockCtx);

		expect(result).toBe(false);
	});
});
