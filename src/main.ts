import { type Server } from 'node:http';
import { start } from './app/app.ts';

const PORT = +process.env.PORT;
const BASE_URL = process.env.BASE_URL;
const SWAGGER_ENABLED = process.env.SWAGGER_UI === 'true';
const SECURITY_ENABLED = process.env.SECURITY_ENABLED === 'true';

// clears previous instance when event isn't fired
if (import.meta.hot?.data.__dispose) {
	await import.meta.hot.data.__dispose?.();
}

// application init
const app = await start({
	port: PORT,
	prefix: BASE_URL,
	swagger: SWAGGER_ENABLED,
});

// application features logging
const logFeatureStatus = (name: string, enabled: boolean) => {
	const bullet = enabled ? '\x1B[32m⦿' : '\x1B[31m⦿';
	const message = enabled ? '\x1B[32mON' : '\x1B[31mOFF';

	console.info(`  ${bullet}\x1B[0m ${name}: ${message}\x1B[0m`);
};

logFeatureStatus(' 📑 Swagger', SWAGGER_ENABLED);
logFeatureStatus(' 🔒 Api Key', SECURITY_ENABLED);

if (import.meta.env.DEV) {
	console.info(
		`\n  \x1B[32m➜\x1B[0m Local: \x1B[36mhttp://localhost:${PORT}/${BASE_URL}\x1B[0m\n`,
	);
}

// disposing on hot reload dev
if (import.meta.hot) {
	const dispose = async () => {
		const server = app.getHttpServer() as Server;
		server.closeAllConnections();
		await app.close();
	};
	import.meta.hot.data.__dispose = dispose;
	// registers disposing event
	import.meta.hot.on('vite:beforeFullReload', dispose);
}
