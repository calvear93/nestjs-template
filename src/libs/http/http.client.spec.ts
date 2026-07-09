import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	type MockInstance,
	test,
	vi,
} from 'vitest';
import { HttpStatusCode } from './enums/http-status.enum.ts';
import { HttpError } from './errors/http.error.ts';
import { TimeoutError } from './errors/timeout.error.ts';
import { HttpClient, type OnRequestInterceptor } from './http.client.ts';

/**
 * Creates a fetch mock implementation that models an in-flight
 * request: it never settles on its own and only rejects (with the
 * abort reason) once the request signal is aborted.
 */
const pendingUntilAborted = () => {
	return (_url: RequestInfo | URL, init?: RequestInit) =>
		new Promise<Response>((_resolve, reject) => {
			const signal = init?.signal;
			if (signal?.aborted) {
				reject(signal.reason);
				return;
			}

			signal?.addEventListener('abort', () => reject(signal.reason), {
				once: true,
			});
		});
};

describe(HttpClient, () => {
	let _httpClient: HttpClient;
	let _altHttpClient: HttpClient;

	let _fetchMock: MockInstance<typeof fetch>;

	// http://localhost/ base URL — no real server is involved, fetch is mocked
	const _URL = 'http://localhost/';

	// hooks
	beforeAll(() => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

		// fetch mock (defaults to an empty 200 response)
		globalThis.fetch = vi.fn(() => Promise.resolve(new Response()));
		_fetchMock = vi.mocked(fetch);

		_httpClient = new HttpClient({ url: _URL });
		_altHttpClient = new HttpClient({
			throwOnClientError: false,
			url: _URL,
		});
	});

	afterEach(() => {
		vi.clearAllTimers();
		vi.clearAllMocks();
	});

	afterAll(() => {
		vi.useRealTimers();
		vi.resetAllMocks();
	});

	// tests
	test('failed request does not throw on throwOnError false', async () => {
		// mocking phase
		_fetchMock.mockResolvedValueOnce(
			new Response(null, {
				status: HttpStatusCode.INTERNAL_SERVER_ERROR,
			}),
		);

		const response = await _altHttpClient.get('/');

		// request phase
		expect(response.ok).toBe(false);
		expect(response.status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
	});

	test('request not ok (status in the range 200-299) throws HttpError', async () => {
		// mocking phase
		_fetchMock.mockResolvedValueOnce(
			new Response(null, { status: HttpStatusCode.BAD_REQUEST }),
		);

		// request phase
		const rejected = _httpClient.request('/');

		await expect(rejected).rejects.toThrow(HttpError);
	});

	test('request failed with TypeError throws Bad Gateway HttpError', async () => {
		// mocking phase
		_fetchMock.mockRejectedValueOnce(new TypeError('message'));

		// request phase
		const rejected = _httpClient.request('/');

		await expect(rejected).rejects.toThrow(HttpError);
		await expect(rejected).rejects.toHaveProperty(
			'status',
			HttpStatusCode.BAD_GATEWAY,
		);
	});

	test('HttpError from TypeError exposes the underlying message via json()', async () => {
		// mocking phase
		const expectedMessage = 'fetch failed';
		_fetchMock.mockRejectedValueOnce(new TypeError(expectedMessage));

		// request phase
		const error = await _httpClient
			.request('/')
			.catch((error_: HttpError) => error_);

		// assertion data
		const body = await (error as HttpError).json<string>();

		expect(error).toBeInstanceOf(HttpError);
		expect(body).toBe(expectedMessage);
	});

	test('request rethrows non-TypeError errors from fetch', async () => {
		// mocking phase
		const cause = new Error('boom');
		_fetchMock.mockRejectedValueOnce(cause);

		// request phase
		const rejected = _httpClient.request('/');

		await expect(rejected).rejects.toBe(cause);
	});

	test('request with json response is success', async () => {
		// mocking phase
		const expectedData = { value: 1 };
		_fetchMock.mockResolvedValueOnce(
			new Response(JSON.stringify(expectedData)),
		);

		// request phase
		const response = await _httpClient.request<typeof expectedData>('/');
		const data = await response.json();

		expect(response.status).toBe(HttpStatusCode.OK);
		expect(data).toStrictEqual(expectedData);
	});

	test('request with text response is success', async () => {
		// mocking phase
		const expectedData = 'ok';
		_fetchMock.mockResolvedValueOnce(new Response(expectedData));

		// request phase
		const response = await _httpClient.request<string>('/');
		const data = await response.text();

		expect(response.status).toBe(HttpStatusCode.OK);
		expect(data).toStrictEqual(expectedData);
	});

	test('request with query params is success', async () => {
		// mocking phase
		const query = { id: '1', name: 'test' };
		const expectedUrl = `${_URL}?${new URLSearchParams(query)}`;

		// request phase
		const { status } = await _httpClient.request('/', {
			query,
		});

		// assertion data
		const receivedUrl = _fetchMock.mock.calls[0][0].toString();

		expect(status).toBe(HttpStatusCode.OK);
		expect(receivedUrl).toBe(expectedUrl);
	});

	test('request with complex query params is success', async () => {
		// mocking phase
		const now = new Date();
		const query = {
			array: ['hola', 'mundo'],
			bigint: 9_007_199_254_740_991n,
			date: now,
			empty: '',
			nested: { prop1: 'hola', prop2: 'mundo' },
			null: null,
			undef: undefined,
		};
		const queryExpected = {
			array: query.array.join(','),
			bigint: query.bigint.toString(),
			date: query.date.toISOString(),
		};
		const expectedUrl = `${_URL}?${new URLSearchParams(queryExpected)}&nested.prop1=hola&nested.prop2=mundo`;

		// request phase
		const { status } = await _httpClient.request('/', {
			query,
		});

		// assertion data
		const receivedUrl = _fetchMock.mock.calls[0][0].toString();

		expect(status).toBe(HttpStatusCode.OK);
		expect(receivedUrl).toBe(expectedUrl);
	});

	test('request with query params as URLSearchParams is success', async () => {
		// mocking phase
		const query = { id: '1', name: 'test' };
		const params = new URLSearchParams(query);
		// allows a list
		params.append('list', '1');
		params.append('list', '2');

		const expectedUrl = `${_URL}?${params}`;

		// request phase
		const { status } = await _httpClient.request('/', {
			query: params,
		});

		// assertion data
		const receivedUrl = _fetchMock.mock.calls[0][0].toString();

		expect(status).toBe(HttpStatusCode.OK);
		expect(receivedUrl).toBe(expectedUrl);
	});

	test('get request is success', async () => {
		// mocking phase
		_fetchMock.mockResolvedValueOnce(new Response());

		// request phase
		const { status } = await _httpClient.get('/');

		expect(status).toBe(HttpStatusCode.OK);
	});

	test('does not mutate the caller config object', async () => {
		// mocking phase
		_fetchMock.mockResolvedValueOnce(new Response('{}', { status: 200 }));
		const config = {};

		// request phase
		await _httpClient.post('/', config);

		expect(config).toStrictEqual({});
	});

	test('throwOnError:false is an alias that disables error throwing', async () => {
		// mocking phase
		_fetchMock.mockResolvedValueOnce(
			new Response(null, {
				status: HttpStatusCode.INTERNAL_SERVER_ERROR,
			}),
		);
		const _client = new HttpClient({ throwOnError: false, url: _URL });

		// request phase
		const response = await _client.get('/');

		expect(response.ok).toBe(false);
		expect(response.status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
	});

	test('post request with json body is success', async () => {
		// mocking phase
		const body = { id: 1, name: 'test' };
		const expectedSerializedBody = JSON.stringify(body);
		_fetchMock.mockResolvedValueOnce(
			new Response(null, { status: HttpStatusCode.CREATED }),
		);

		// request phase
		const { status } = await _httpClient.post('/', {
			data: body,
		});

		// assertion data
		const request = _fetchMock.mock.calls[0][1]!;

		expect(status).toBe(HttpStatusCode.CREATED);
		expect(request.body).toBe(expectedSerializedBody);
	});

	test('post request with url encoded body has correct content-type', async () => {
		// mocking phase
		const body = { value: 'test' };
		const expectedContentType =
			'application/x-www-form-urlencoded;charset=utf-8';
		_fetchMock.mockResolvedValueOnce(
			new Response(null, { status: HttpStatusCode.CREATED }),
		);

		// request phase
		const { status } = await _httpClient.post('/', {
			data: new URLSearchParams(body),
		});

		// assertion data
		const headers = _fetchMock.mock.calls[0][1]!.headers as Record<
			string,
			string
		>;

		expect(status).toBe(HttpStatusCode.CREATED);
		expect(headers['content-type']).toBe(expectedContentType);
	});

	test('put request is success', async () => {
		// mocking phase
		_fetchMock.mockResolvedValueOnce(
			new Response(null, { status: HttpStatusCode.NO_CONTENT }),
		);

		// request phase
		const { status } = await _httpClient.put('/');

		expect(status).toBe(HttpStatusCode.NO_CONTENT);
	});

	test('patch request is success', async () => {
		// mocking phase
		_fetchMock.mockResolvedValueOnce(
			new Response(null, { status: HttpStatusCode.NO_CONTENT }),
		);

		// request phase
		const { status } = await _httpClient.patch('/');

		expect(status).toBe(HttpStatusCode.NO_CONTENT);
	});

	test('delete request is success', async () => {
		// mocking phase
		_fetchMock.mockResolvedValueOnce(
			new Response(null, { status: HttpStatusCode.ACCEPTED }),
		);

		// request phase
		const { status } = await _httpClient.delete('/');

		expect(status).toBe(HttpStatusCode.ACCEPTED);
	});

	test('request fails for timeout', async () => {
		// mocking phase
		// fetch never resolves on its own; it only settles when the
		// client's timeout aborts the request signal
		_fetchMock.mockImplementationOnce(pendingUntilAborted());

		const request = _httpClient.get<string>('/', { timeout: 1 });
		// attach the rejection handler before advancing timers so the
		// abort rejection is never momentarily unhandled
		const assertion = expect(request).rejects.toThrow(TimeoutError);

		// request phase
		await vi.advanceTimersByTimeAsync(1); // trigger the client timeout
		await assertion;
	});

	test('clears the timeout timer when the response resolves in time', async () => {
		// mocking phase
		_fetchMock.mockResolvedValueOnce(new Response());

		// request phase
		const { status } = await _httpClient.get('/', { timeout: 5000 });

		expect(status).toBe(HttpStatusCode.OK);
		expect(vi.getTimerCount()).toBe(0);
	});

	test('clears the timeout timer when the request fails', async () => {
		// mocking phase
		_fetchMock.mockRejectedValueOnce(new TypeError('network failure'));

		// request phase
		const rejected = _httpClient.get('/', { timeout: 5000 });

		await expect(rejected).rejects.toThrow(HttpError);
		expect(vi.getTimerCount()).toBe(0);
	});

	test('omits query string when all params are nullish', async () => {
		// mocking phase
		_fetchMock.mockResolvedValueOnce(new Response());

		// request phase
		const { status } = await _httpClient.request('/', {
			query: { skip: null },
		});

		// assertion data
		const receivedUrl = _fetchMock.mock.calls[0][0].toString();

		expect(status).toBe(HttpStatusCode.OK);
		expect(receivedUrl).toBe(_URL);
	});

	test('appends trailing slash to base URL when missing', async () => {
		// mocking phase
		_fetchMock.mockResolvedValueOnce(new Response());

		// request phase
		const client = new HttpClient({ url: _URL.slice(0, -1) });
		await client.request('/');

		// assertion data
		const receivedUrl = _fetchMock.mock.calls[0][0].toString();

		expect(receivedUrl).toBe(_URL);
	});

	test('request can be aborted', async () => {
		// mocking phase
		_fetchMock.mockImplementationOnce(pendingUntilAborted());

		// request phase
		const controller = new AbortController();

		const promise = _httpClient.get('/', {
			cancel: controller,
		});

		controller.abort();

		await expect(promise).rejects.toThrow();
	});

	test('basic auth', () => {
		const user = 'user';
		const password = 'password';
		const expected = `${user}:${password}`;

		const encoded = HttpClient.basicAuth(user, password);
		const decode = Buffer.from(encoded, 'base64url').toString('utf8');

		expect(decode).toBe(expected);
	});

	describe('url parsing', () => {
		// hooks
		beforeAll(() => {
			_fetchMock.mockResolvedValue(new Response());
		});

		afterAll(() => {
			_fetchMock.mockClear();
		});

		// tests
		test('root', async () => {
			// mocking phase
			const path = '/';
			const expectedUrl = `${_URL}`;

			// request phase
			const http = new HttpClient({ url: _URL });
			await http.request(path);

			// assertion data
			const receivedUrl = _fetchMock.mock.calls[0][0].toString();

			expect(receivedUrl).toBe(expectedUrl);
		});

		test('path with slash', async () => {
			// mocking phase
			const path = '/api/path';
			const expectedUrl = `${_URL}api/path`;

			// request phase
			const http = new HttpClient({ url: _URL });
			await http.request(path);

			// assertion data
			const receivedUrl = _fetchMock.mock.calls[0][0].toString();

			expect(receivedUrl).toBe(expectedUrl);
		});

		test('path without slash', async () => {
			// mocking phase
			const path = 'api/path';
			const expectedUrl = `${_URL}api/path`;

			// request phase
			const http = new HttpClient({ url: _URL });
			await http.request(path);

			// assertion data
			const receivedUrl = _fetchMock.mock.calls[0][0].toString();

			expect(receivedUrl).toBe(expectedUrl);
		});

		test('with params', async () => {
			// mocking phase
			const path = '/api/path';
			const query = {
				p1: 1,
				p2: 'hello',
			};
			const expectedUrl = `${_URL}api/path?p1=1&p2=hello`;

			// request phase
			const http = new HttpClient({ url: _URL });
			await http.request(path, { query });

			// assertion data
			const receivedUrl = _fetchMock.mock.calls[0][0].toString();

			expect(receivedUrl).toBe(expectedUrl);
		});
	});

	test('base URL is not required in initial config', async () => {
		_fetchMock.mockResolvedValueOnce(new Response());
		const client = new HttpClient({});

		// request phase
		await client.request(_URL);

		// assertion data
		const receivedUrl = _fetchMock.mock.calls[0][0].toString();

		expect(receivedUrl).toBe(_URL);
	});

	test('can get and set config', () => {
		const initialTimeout = 1;
		const expectedTimeout = 2;
		const client = new HttpClient({ timeout: initialTimeout });

		client.config.timeout = expectedTimeout;

		expect(client.config.timeout).not.toBe(initialTimeout);
		expect(client.config.timeout).toBe(expectedTimeout);
	});

	test('can set config by object and it merges the config', () => {
		const expectedHeaders = { a: '1' };
		const expectedTimeout = 2;
		const client = new HttpClient({ headers: expectedHeaders });

		client.config = { timeout: expectedTimeout };

		expect(client.config.timeout).toBe(expectedTimeout);
		expect(client.config.headers).toStrictEqual(expectedHeaders);
	});

	test('can set a specific header', () => {
		const expectedHeaderKey = 'key';
		const expectedHeaderValue = 'value';
		const client = new HttpClient();

		client.setHeader(expectedHeaderKey, expectedHeaderValue);

		expect(client.config.headers?.[expectedHeaderKey]).toBe(
			expectedHeaderValue,
		);
	});

	test('can intercept request config', async () => {
		_fetchMock.mockResolvedValueOnce(new Response());
		const expectedHeaders = { anyHeader: 'anyValue' };
		const mockRequestInterceptor = vi.fn<OnRequestInterceptor>((config) => {
			config.headers = expectedHeaders;
		});
		const client = new HttpClient({
			onRequest: mockRequestInterceptor,
		});

		// request phase
		await client.request(_URL);

		// assertion data
		const receivedUrl = _fetchMock.mock.calls[0][0].toString();
		const receivedConfig = _fetchMock.mock.calls[0][1];

		expect(receivedUrl).toBe(_URL);
		expect(mockRequestInterceptor).toHaveBeenCalledOnce();
		expect(receivedConfig?.headers).toStrictEqual(expectedHeaders);
	});
});
