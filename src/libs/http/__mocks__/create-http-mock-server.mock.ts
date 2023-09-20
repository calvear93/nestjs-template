import http, {
	type IncomingMessage,
	type Server,
	type ServerResponse,
} from 'node:http';
import { vi, type Mock } from 'vitest';

export const createHttpMockServer = (
	port: number,
): [Server, Mock<[IncomingMessage, ServerResponse]>] => {
	const mock = vi.fn<[IncomingMessage, ServerResponse]>();
	const server = http.createServer().listen(port, 'localhost');

	server.on('request', mock);

	return [server, mock];
};
