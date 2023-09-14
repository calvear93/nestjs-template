import { describe } from 'node:test';
import http, { type Server } from 'node:http';
import { afterAll, beforeAll, bench, expect } from 'vitest';
import { HttpProvider } from './http.provider.ts';

const PORT = 5678;
const BENCH_CONFIG: Parameters<typeof bench>[2] = {
	warmupIterations: 5000,
};

const createHttpServer = (responseBody: object): Server => {
	const server = http.createServer().listen(PORT, 'localhost');

	server.on('request', (request, response) => {
		response.writeHead(200, 'Ok', {
			'Content-Type': 'application/json',
		});
		response.end(JSON.stringify(responseBody));
	});

	return server;
};

describe(`${HttpProvider.name} benchmark`, () => {
	let _server: Server;
	let _provider: HttpProvider;
	const _url = `http://localhost:${PORT}`;
	const _responseBody = { message: 'Ok' };

	beforeAll(() => {
		_server = createHttpServer(_responseBody);
		_provider = new HttpProvider({ url: _url });
	});

	afterAll(() => {
		_server.closeAllConnections();
		_server.close();
	});

	bench(
		'native fetch',
		async () => {
			const response = await fetch(_url, {
				body: JSON.stringify({ id: 1, name: 'a name' }),
				method: 'POST',
			});

			const body = await response.json();

			expect(response.ok).toBe(true);
			expect(body).toStrictEqual(_responseBody);
		},
		BENCH_CONFIG,
	);

	bench(
		'HTTP provider',
		async () => {
			const response = await _provider.post(_url, {
				data: { id: 1, name: 'a name' },
			});

			const body = await response.json();

			expect(response.ok).toBe(true);
			expect(body).toStrictEqual(_responseBody);
		},
		BENCH_CONFIG,
	);
});
