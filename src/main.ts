import { type Server } from 'node:http';
import { start } from './app/app.ts';

const app = await start();

// disposing on hot reload dev
if (import.meta.hot) {
	import.meta.hot.on('vite:beforeFullReload', () => {
		const server = app.getHttpServer() as Server;
		server.closeAllConnections();
		return app.close();
	});
}
