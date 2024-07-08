import http, { type RequestListener, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { type Mock, vi } from 'vitest';

/**
 * Creates a basic HTTP server
 * for tests requests.
 *
 * @param port - localhost port
 * @param hostname - localhost
 *
 * @returns HTTP server and request handler mocker
 */
export const createHttpMockServer = (
	port = 0,
	hostname = 'localhost',
): Promise<[Server, Mock<RequestListener>, port: number]> => {
	const mock = vi.fn<RequestListener>();
	const server = http.createServer().listen(port, hostname);

	server.on('request', mock);

	return new Promise((resolve, reject) => {
		server.on('listening', () => {
			const port = (server.address() as AddressInfo).port;
			resolve([server, mock, port]);
		});
		server.on('error', reject);
	});
};
