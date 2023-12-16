import { type Server } from 'node:http';
import { start } from './app/app.ts';

const app = await start({
	port: +process.env.PORT,
	prefix: process.env.BASE_URL,
	swagger: process.env.SWAGGER_UI === 'true',
});

// disposing on hot reload, dev mode only
if (import.meta.hot) {
	// https://vitejs.dev/guide/api-hmr
	import.meta.hot.on('vite:beforeFullReload', () => {
		const server = app.getHttpServer() as Server;
		server.closeAllConnections();
		return app.close();
	});
}
