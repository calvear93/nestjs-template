import { start } from './app/app.ts';

const PORT = +process.env.PORT;
const BASE_URL = process.env.BASE_URL;
const SWAGGER_ENABLED = process.env.SWAGGER_UI === 'true';
const SECURITY_ENABLED = process.env.SECURITY_ENABLED === 'true';

// resolves pending async cleanup
if (import.meta.hot) {
	const { data } = import.meta.hot;
	if (data.__pendingCleanup) {
		console.info(
			'  \x1B[32m⚙\x1B[0m HMR: \x1B[36mReloading Module ...\x1B[0m\n',
		);
		await Promise.allSettled(data.__pendingCleanup);
	}
	data.__pendingCleanup = [];
}

// application init
const { dispose } = await start({
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

	// disposing on hot reload dev
	import.meta.hot?.on('vite:beforeFullReload', () => {
		import.meta.hot!.data.__pendingCleanup.push(dispose());
	});
}
