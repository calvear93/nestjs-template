import type { AddressInfo } from 'node:net';
import http, {
	type IncomingMessage,
	type Server,
	type ServerResponse,
} from 'node:http';
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
): Promise<[Server, Mock<[IncomingMessage, ServerResponse]>, port: number]> => {
	const mock = vi.fn<[IncomingMessage, ServerResponse]>();
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
