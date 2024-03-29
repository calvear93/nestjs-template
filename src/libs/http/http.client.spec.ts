import {
	type IncomingMessage,
	type Server,
	type ServerResponse,
} from 'node:http';
import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	test,
	vi,
	type Mock,
	type MockInstance,
} from 'vitest';
import { HttpClient } from './http.client.ts';
import { TimeoutError } from './errors/timeout.error.ts';
import { HttpError } from './errors/http.error.ts';
import { HttpStatusCode } from './enums/http-status.enum.ts';
import { createHttpMockServer } from './__mocks__/create-http-mock-server.mock.ts';

describe(HttpClient, () => {
	let _httpClient: HttpClient;
	let _altHttpClient: HttpClient;

	let _server: Server;
	let _serverResponse: Mock<[IncomingMessage, ServerResponse]>;
	let _fetchMock: MockInstance<
		Parameters<typeof fetch>,
		ReturnType<typeof fetch>
	>;

	const _PORT = 5678;
	const _URL = `http://localhost:${_PORT}/`;

	// hooks
	beforeAll(() => {
		vi.useFakeTimers();

		// mock server
		[_server, _serverResponse] = createHttpMockServer(_PORT);
		// fetch spy
		_fetchMock = vi.spyOn(globalThis, 'fetch');

		_httpClient = new HttpClient({ url: _URL });
		_altHttpClient = new HttpClient({
			throwOnClientError: false,
			url: _URL,
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
		vi.clearAllTimers();
	});

	afterAll(() => {
		vi.useRealTimers();

		_server.closeAllConnections();
		_server.close();
	});

	// tests
	test('common http client should be defined', () => {
		expect(_httpClient).toBeDefined();
	});

	test('alternative http client should be defined and configured', () => {
		expect(_altHttpClient).toBeDefined();
	});

	test('failed request does not throw on throwOnError false', async () => {
		// mocking phase
		_serverResponse.mockImplementationOnce((_, response) => {
			response.writeHead(HttpStatusCode.INTERNAL_SERVER_ERROR).end();
		});

		const response = await _altHttpClient.get('/');

		// request phase
		expect(response.ok).toBe(false);
		expect(response.status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
	});

	test('request not ok (status in the range 200-299) throws HttpError', async () => {
		// mocking phase
		_serverResponse.mockImplementationOnce((_, response) => {
			response.writeHead(HttpStatusCode.BAD_REQUEST).end();
		});

		// request phase
		const rejected = _httpClient.request('/');

		await expect(rejected).rejects.toThrowError(HttpError);
	});

	test('request failed with TypeError throws Bad Gateway HttpError', async () => {
		// mocking phase
		_fetchMock.mockRejectedValueOnce(new TypeError('message'));

		// request phase
		const rejected = _httpClient.request('/');

		await expect(rejected).rejects.toThrowError(HttpError);
		await expect(rejected).rejects.toHaveProperty(
			'status',
			HttpStatusCode.BAD_GATEWAY,
		);
	});

	test('request with json response is success', async () => {
		// mocking phase
		const expectedData = { value: 1 };
		_serverResponse.mockImplementationOnce((_, response) => {
			response.end(JSON.stringify(expectedData));
		});

		// request phase
		const response = await _httpClient.request<typeof expectedData>('/');
		const data = await response.json();

		expect(response.status).toBe(HttpStatusCode.OK);
		expect(data).toStrictEqual(expectedData);
	});

	test('request with text response is success', async () => {
		// mocking phase
		const expectedData = 'ok';
		_serverResponse.mockImplementationOnce((_, response) => {
			response.end(expectedData);
		});

		// request phase
		const response = await _httpClient.request<string>('/');
		const data = await response.text();

		expect(response.status).toBe(HttpStatusCode.OK);
		expect(data).toStrictEqual(expectedData);
	});

	test('request with params is success', async () => {
		// mocking phase
		const query = { id: '1', name: 'test' };
		const expectedUrl = `/?${new URLSearchParams(query)}`;
		_serverResponse.mockImplementationOnce((_, response) => {
			response.end();
		});

		// request phase
		const { status } = await _httpClient.request('/', {
			query,
		});

		// assertion data
		const receivedUrl = _serverResponse.mock.calls[0][0].url;

		expect(status).toBe(HttpStatusCode.OK);
		expect(receivedUrl).toBe(expectedUrl);
	});

	test('get request is success', async () => {
		// mocking phase
		_serverResponse.mockImplementationOnce((_, response) => {
			response.end();
		});

		// request phase
		const { status } = await _httpClient.get('/');

		expect(status).toBe(HttpStatusCode.OK);
	});

	test('post request with json body is success', async () => {
		// mocking phase
		const body = { id: 1, name: 'test' };
		const expectedSerializedBody = JSON.stringify(body);
		_serverResponse.mockImplementationOnce((_, response) => {
			response.writeHead(HttpStatusCode.CREATED).end();
		});

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
		_serverResponse.mockImplementationOnce((_, response) => {
			response.writeHead(HttpStatusCode.CREATED).end();
		});

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
		_serverResponse.mockImplementationOnce((_, response) => {
			response.writeHead(HttpStatusCode.NO_CONTENT).end();
		});

		// request phase
		const { status } = await _httpClient.put('/');

		expect(status).toBe(HttpStatusCode.NO_CONTENT);
	});

	test('patch request is success', async () => {
		// mocking phase
		_serverResponse.mockImplementationOnce((_, response) => {
			response.writeHead(HttpStatusCode.NO_CONTENT).end();
		});

		// request phase
		const { status } = await _httpClient.patch('/');

		expect(status).toBe(HttpStatusCode.NO_CONTENT);
	});

	test('delete request is success', async () => {
		// mocking phase
		_serverResponse.mockImplementationOnce((_, response) => {
			response.writeHead(HttpStatusCode.ACCEPTED).end();
		});

		// request phase
		const { status } = await _httpClient.delete('/');

		expect(status).toBe(HttpStatusCode.ACCEPTED);
	});

	test('request fails for timeout', async () => {
		// mocking phase
		_serverResponse.mockImplementationOnce(async (_, response) => {
			await vi.advanceTimersToNextTimerAsync(); // wait for http timeout
			response.end();
		});

		const request = _httpClient.get<string>('/', { timeout: 1 });

		// request phase
		await expect(request).rejects.toThrow(TimeoutError);
	});

	test('request can be aborted', async () => {
		// mocking phase
		_serverResponse.mockImplementationOnce((_, response) => {
			response.end();
		});

		// request phase
		const controller = new AbortController();

		const promise = _httpClient.get('/', {
			cancel: controller,
		});

		controller.abort();

		await expect(promise).rejects.toThrowError();
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
			_serverResponse.mockImplementation((_, response) => {
				response.end();
			});
		});

		afterAll(() => {
			_serverResponse.mockClear();
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
});
