import { bench, describe, expect } from 'vitest';
import { HttpClient } from './http.client.ts';
import { createHttpMockServer } from './__mocks__/create-http-mock-server.mock.ts';

const PORT = 5678;
const BENCH_CONFIG: Parameters<typeof bench>[2] = {
	time: 5000,
	warmupIterations: 100,
};

describe(HttpClient.name, () => {
	const _url = `http://localhost:${PORT}`;
	const _responseBody = { message: 'Ok' };

	const [_server, _serverMock] = createHttpMockServer(PORT);
	const _provider = new HttpClient({ url: _url });

	_serverMock.mockImplementation((_, response) => {
		response.writeHead(200, 'Ok', {
			'Content-Type': 'application/json',
		});
		response.end(JSON.stringify(_responseBody));
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
