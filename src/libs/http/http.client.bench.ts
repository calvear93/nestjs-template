import { after, before, describe } from 'node:test';
import {
	type IncomingMessage,
	type Server,
	type ServerResponse,
} from 'node:http';
import { bench, expect, type Mock } from 'vitest';
import { HttpClient } from './http.client.ts';
import { createHttpMockServer } from './__mocks__/create-http-mock-server.mock.ts';

const PORT = 5678;
const BENCH_CONFIG: Parameters<typeof bench>[2] = {
	time: 5000,
	warmupIterations: 100,
};

await describe(HttpClient.name, () => {
	let _server: Server;
	let _serverMock: Mock<[IncomingMessage, ServerResponse]>;
	let _provider: HttpClient;
	const _url = `http://localhost:${PORT}`;
	const _responseBody = { message: 'Ok' };

	before(() => {
		[_server, _serverMock] = createHttpMockServer(PORT);
		_provider = new HttpClient({ url: _url });

		_serverMock.mockImplementation((_, response) => {
			response.writeHead(200, 'Ok', {
				'Content-Type': 'application/json',
			});
			response.end(JSON.stringify(_responseBody));
		});
	});

	after(() => {
		_server.closeAllConnections();
		_server.close();
	});

	bench(
		'HTTP client',
		async () => {
			const response = await _provider.post(_url, {
				data: { id: 1, name: 'a name' },
				query: { id: 1, name: 'test', page: 100, size: 999 },
				timeout: 200,
			});

			const body = await response.json();

			expect(response.ok).toBe(true);
			expect(body).toStrictEqual(_responseBody);
		},
		BENCH_CONFIG,
	);

	bench(
		'native fetch',
		async () => {
			const query = new URLSearchParams({
				id: '1',
				name: 'test',
				page: '100',
				size: '999',
			});

			const response = await fetch(`${_url}?${query})}`, {
				body: JSON.stringify({ id: 1, name: 'a name' }),
				method: 'POST',
			});

			const body = await response.json();

			expect(response.ok).toBe(true);
			expect(body).toStrictEqual(_responseBody);
		},
		BENCH_CONFIG,
	);
});
