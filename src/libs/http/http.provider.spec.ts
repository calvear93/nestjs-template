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
import { Test, type TestingModule } from '@nestjs/testing';
import { HttpProvider } from './http.provider.ts';
import { TimeoutError } from './errors/timeout.error.ts';
import { HttpError } from './errors/http.error.ts';
import { HttpStatusCode } from './enums/http-status.enum.ts';
import { createHttpMockServer } from './__mocks__/create-http-mock-server.mock.ts';

describe(HttpProvider, () => {
	let _module: TestingModule;
	let _provider: HttpProvider;

	let _server: Server;
	let _serverResponse: Mock<[IncomingMessage, ServerResponse]>;
	let _fetchMock: MockInstance<
		Parameters<typeof fetch>,
		ReturnType<typeof fetch>
	>;

	const _PORT = 5678;
	const _URL = `http://localhost:${_PORT}`;

	const _altToken = 'alt';

	// hooks
	beforeAll(async () => {
		_module = await Test.createTestingModule({
			providers: [
				HttpProvider.register({ url: _URL }),
				HttpProvider.register({
					useToken: _altToken,
				}),
			],
		}).compile();

		// mock server
		[_server, _serverResponse] = createHttpMockServer(_PORT);
		// fetch spy
		_fetchMock = vi.spyOn(globalThis, 'fetch');

		_provider = _module.get<HttpProvider>(HttpProvider);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	afterAll(async () => {
		await _module.close();
		_server.closeAllConnections();
		_server.close();
	});

	// tests
	test('common http provider should be defined', () => {
		expect(_provider).toBeDefined();
	});

	test('alternative http provider should be defined and configured', () => {
		const altProvider = _module.get<HttpProvider>(_altToken);

		expect(altProvider).toBeDefined();
	});

	test('request not ok (status in the range 200-299) throws HttpError', async () => {
		// mocking phase
		_serverResponse.mockImplementationOnce((_, response) => {
			response.writeHead(HttpStatusCode.BAD_REQUEST).end();
		});

		// request phase
		await expect(_provider.request('/')).rejects.toThrowError(HttpError);
	});

	test('request with json response is success', async () => {
		// mocking phase
		const expectedData = { value: 1 };
		_serverResponse.mockImplementationOnce((_, response) => {
			response.end(JSON.stringify(expectedData));
		});

		// request phase
		const response = await _provider.request<typeof expectedData>('/');
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
		const response = await _provider.request<string>('/');
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
		const { status } = await _provider.request('/', {
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
		const { status } = await _provider.get('/');

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
		const { status } = await _provider.post('/', {
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
		const { status } = await _provider.post('/', {
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
		const { status } = await _provider.put('/');

		expect(status).toBe(HttpStatusCode.NO_CONTENT);
	});

	test('patch request is success', async () => {
		// mocking phase
		_serverResponse.mockImplementationOnce((_, response) => {
			response.writeHead(HttpStatusCode.NO_CONTENT).end();
		});

		// request phase
		const { status } = await _provider.patch('/');

		expect(status).toBe(HttpStatusCode.NO_CONTENT);
	});

	test('delete request is success', async () => {
		// mocking phase
		_serverResponse.mockImplementationOnce((_, response) => {
			response.writeHead(HttpStatusCode.ACCEPTED).end();
		});

		// request phase
		const { status } = await _provider.delete('/');

		expect(status).toBe(HttpStatusCode.ACCEPTED);
	});

	test('request fails for timeout', async () => {
		// mocking phase
		_serverResponse.mockImplementationOnce((_, response) => {
			setTimeout(() => response.end(), 2);
		});

		// request phase
		await expect(
			_provider.get<string>('/', { timeout: 1 }),
		).rejects.toThrow(TimeoutError);
	});

	test('request can be aborted', async () => {
		// mocking phase
		_serverResponse.mockImplementationOnce((_, response) => {
			response.end();
		});

		// request phase
		const controller = new AbortController();

		const promise = _provider.get('/', {
			cancel: controller,
		});

		controller.abort();

		await expect(promise).rejects.toThrowError();
	});
});
