import http, {
	type IncomingMessage,
	type Server,
	type ServerResponse,
} from 'node:http';
import { vi, type Mock } from 'vitest';

/**
 * Creates a basic HTTP server
 * for tests requests.
 *
 * @param port - localhost port
 *
 * @returns HTTP server and request handler mocker
 */
export const createHttpMockServer = (
	port: number,
): [Server, Mock<[IncomingMessage, ServerResponse]>] => {
	const mock = vi.fn<[IncomingMessage, ServerResponse]>();
	const server = http.createServer().listen(port, 'localhost');

	server.on('request', mock);

	return [server, mock];
};
