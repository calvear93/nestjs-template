import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	test,
	vi,
	type SpyInstance,
} from 'vitest';
import { Test, type TestingModule } from '@nestjs/testing';
import { HttpProvider } from './http.provider.ts';
import { HttpError } from './http.error.ts';
import { HttpStatusCode } from './enums/http-status.enum.ts';

describe(HttpProvider, () => {
	let module: TestingModule;
	let provider: HttpProvider;
	let fetchMock: SpyInstance<
		Parameters<typeof fetch>,
		ReturnType<typeof fetch>
	>;

	const altToken = 'alt';
	const url = 'https://api.com';

	// hooks
	beforeAll(async () => {
		module = await Test.createTestingModule({
			providers: [
				HttpProvider.register({ url }),
				HttpProvider.register({
					useToken: altToken,
				}),
			],
		}).compile();

		provider = module.get<HttpProvider>(HttpProvider);
		// fetch mock
		fetchMock = vi.spyOn(globalThis, 'fetch');
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	afterAll(async () => {
		await module.close();
	});

	// tests
	test('common http provider should be defined', () => {
		expect(provider).toBeDefined();
	});

	test('alternative http provider should be defined and configured', () => {
		const altProvider = module.get<HttpProvider>(altToken);

		expect(altProvider).toBeDefined();
	});

	test('request not ok (status in the range 200-299) throws HttpError', () => {
		// mocking phase
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: HttpStatusCode.BAD_REQUEST, // doesn't affect this test due to mock
		} as Response);

		// request phase
		expect(provider.request('/')).rejects.toThrowError(HttpError);
	});

	test('request with json response is success', async () => {
		// mocking phase
		const expectedData = { value: 1 };
		fetchMock.mockResolvedValueOnce({
			json: () => Promise.resolve(expectedData),
			ok: true,
			status: HttpStatusCode.OK,
		} as Response);

		// request phase
		const response = await provider.request<typeof expectedData>('/');
		const data = await response.json();

		expect(response.status).toBe(HttpStatusCode.OK);
		expect(data).toStrictEqual(expectedData);
	});

	test('request with text response is success', async () => {
		// mocking phase
		const expectedData = 'ok';
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: HttpStatusCode.OK,
			text: () => Promise.resolve(expectedData),
		} as Response);

		// request phase
		const response = await provider.request<string>('/');
		const data = await response.text();

		expect(response.status).toBe(HttpStatusCode.OK);
		expect(data).toStrictEqual(expectedData);
	});

	test('request with params is success', async () => {
		// mocking phase
		const query = { id: '1', name: 'test' };
		const expectedUrl = `${url}/?${new URLSearchParams(query)}`;
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: HttpStatusCode.OK,
		} as Response);

		// request phase
		const { status } = await provider.request('/', {
			query,
		});

		// assertion data
		const innerUrl = (fetchMock.mock.calls[0][0] as URL).href;

		expect(status).toBe(HttpStatusCode.OK);
		expect(innerUrl).toBe(expectedUrl);
	});

	test('get request is success', async () => {
		// mocking phase
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: HttpStatusCode.OK,
		} as Response);

		// request phase
		const { status } = await provider.get('/');

		expect(status).toBe(HttpStatusCode.OK);
	});

	test('post request is success', async () => {
		// mocking phase
		const body = { id: 1, name: 'test' };
		const expectedSerializedBody = JSON.stringify(body);
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: HttpStatusCode.CREATED,
		} as Response);

		// request phase
		const { status } = await provider.post('/', {
			data: body,
		});

		// assertion data
		const innerBody = (fetchMock.mock.calls[0][1] as Record<string, string>)
			.body;

		expect(status).toBe(HttpStatusCode.CREATED);
		expect(innerBody).toBe(expectedSerializedBody);
	});

	test('put request is success', async () => {
		// mocking phase
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: HttpStatusCode.NO_CONTENT,
		} as Response);

		// request phase
		const { status } = await provider.put('/');

		expect(status).toBe(HttpStatusCode.NO_CONTENT);
	});

	test('patch request is success', async () => {
		// mocking phase
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: HttpStatusCode.NO_CONTENT,
		} as Response);

		// request phase
		const { status } = await provider.patch('/');

		expect(status).toBe(HttpStatusCode.NO_CONTENT);
	});

	test('delete request is success', async () => {
		// mocking phase
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: HttpStatusCode.ACCEPTED,
		} as Response);

		// request phase
		const { status } = await provider.delete('/');

		expect(status).toBe(HttpStatusCode.ACCEPTED);
	});
});
