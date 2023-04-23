import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	type Mock,
	test,
	vi,
} from 'vitest';
import nock from 'nock';
import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { Test, type TestingModule } from '@nestjs/testing';
import { type AxiosInterceptorConfig, HttpProvider } from './http.provider.js';

describe(HttpProvider.name, () => {
	let _module: TestingModule;
	let _provider: HttpProvider;

	const HTTP_ALT_TOKEN = 'alt';
	const baseURL = 'https://api.com';
	const baseURLAlt = 'https://api.com/alt';

	const axiosInterceptors: AxiosInterceptorConfig = {
		request: {
			onFulfilled: vi.fn(
				(response) => response as InternalAxiosRequestConfig,
			),
			onRejected: vi.fn((error) => {
				throw error;
			}),
		},
		response: {
			onFulfilled: vi.fn((response) => response),
			onRejected: vi.fn((error) => {
				throw error;
			}),
		},
	};

	// hooks
	beforeAll(async () => {
		_module = await Test.createTestingModule({
			providers: [
				HttpProvider.register({ baseURL }, axiosInterceptors),
				HttpProvider.register({
					useToken: HTTP_ALT_TOKEN,
					baseURL: baseURLAlt,
				}),
			],
		}).compile();

		_provider = _module.get(HttpProvider);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	afterAll(async () => {
		await _module.close();
		nock.cleanAll();
	});

	// tests
	test('common http provider should be defined', () => {
		expect(_provider).toBeDefined();
	});

	test('alternative http provider should be defined and configured', () => {
		const altProvider = _module.get<HttpProvider>(HTTP_ALT_TOKEN);

		expect(altProvider).toBeDefined();
		expect(altProvider.axiosRef.defaults.baseURL).toBe(baseURLAlt);
	});

	test('get request is success', async () => {
		// mocking phase
		nock(baseURL).get('/').reply(200, 'ok');

		// request phase
		const response = await _provider.get<string>('/');

		expect(response.data).toBe('ok');
	});

	test('get request with json response is success', async () => {
		// mocking phase
		const data = { value: 1 };
		nock(baseURL).get('/').reply(200, data);

		// request phase
		const response = await _provider.get<typeof data>('/');

		expect(response.data).toStrictEqual(data);
	});

	test('get request with params is success', async () => {
		// mocking phase
		const params = { id: 1, name: 'test' };
		nock(baseURL).get('/').query(params).reply(200, 'ok');

		// request phase
		const response = await _provider.get<string>('/', {
			params,
		});

		expect(response.data).toBe('ok');
	});

	test('post request is success', async () => {
		// mocking phase
		const body = { id: 1, name: 'test' };
		const result = { result: { ...body, time: Date.now() } };
		nock(baseURL).post('/', body).reply(201, result);

		// request phase
		const response = await _provider.post<typeof result>('/', body);

		expect(response.data).toStrictEqual(result);
	});

	test('put request is success', async () => {
		// mocking phase
		const body = { id: 1, name: 'test' };
		nock(baseURL).put('/', body).reply(204, 'ok');

		// request phase
		const response = await _provider.put<string>('/', body);

		expect(response.data).toBe('ok');
	});

	test('patch request is success', async () => {
		// mocking phase
		const body = { id: 1, name: 'test' };
		nock(baseURL).patch('/', body).reply(204, 'ok');

		// request phase
		const response = await _provider.patch<string>('/', body);

		expect(response.data).toBe('ok');
	});

	test('delete request with params is success', async () => {
		// mocking phase
		nock(baseURL).delete('/').reply(204, 'ok');

		// request phase
		const response = await _provider.delete<string>('/');

		expect(response.data).toBe('ok');
	});

	test('HEAD request with params is success', async () => {
		// mocking phase
		nock(baseURL).head('/').reply(200, 'ok');

		// request phase
		const response = await _provider.head<string>('/');

		expect(response.data).toBe('ok');
	});

	test('request and response interceptors should been called on success', async () => {
		// mocking phase
		nock(baseURL).get('/').reply(200, 'ok');

		// request phase
		const response = await _provider.get<string>('/');

		// interception mocks validation
		const requestOnFulfilled = axiosInterceptors.request
			?.onFulfilled as Mock;
		const responeOnFulfilled = axiosInterceptors.response
			?.onFulfilled as Mock;

		expect(response.data).toBe('ok');
		expect(requestOnFulfilled).toHaveBeenCalledTimes(1);
		expect(responeOnFulfilled).toHaveBeenCalledTimes(1);
	});

	test('request and response interceptors should been called on error', async () => {
		// mocking phase
		nock(baseURL).get('/').reply(500);

		// request phase
		await expect(_provider.get('/')).rejects.toThrow();

		// interception mocks validation
		const requestOnRejected = axiosInterceptors.request?.onRejected as Mock;
		const responeOnRejected = axiosInterceptors.response
			?.onRejected as Mock;

		expect(requestOnRejected).toHaveBeenCalledTimes(0);
		expect(responeOnRejected).toHaveBeenCalledTimes(1);
	});

	test('request does not fails for timeout if response completes before', async () => {
		// mocking phase
		nock(baseURL).get('/').delay(20).reply(200);

		// request phase
		await expect(
			_provider.get<string>('/', { timeout: 100 }),
		).resolves.toBeDefined();
	});

	test('request fails for timeout', async () => {
		// mocking phase
		nock(baseURL).get('/').delay(200).reply(200);

		// request phase
		await expect(
			_provider.get<string>('/', { timeout: 20 }),
		).rejects.toThrow();
	});

	test('request can be aborted', async () => {
		// mocking phase
		nock(baseURL).get('/').delay(200).reply(200);

		// request phase
		const controller = new AbortController();

		const promise = _provider.request({
			url: '/',
			method: 'get',
			signal: controller.signal,
		});

		controller.abort();

		await expect(promise).rejects.toMatchObject({
			code: 'ERR_CANCELED',
			message: 'canceled',
		});
	});

	test('AxiosError is matched by isAxiosError method', () => {
		const axiosError = new AxiosError('axios error');

		expect(HttpProvider.isAxiosError(axiosError)).toBeTruthy();
	});
});
