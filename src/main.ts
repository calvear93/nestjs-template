import { start } from './app/app.ts';

const PORT = +process.env.PORT;
const BASE_URL = process.env.BASE_URL;
const SWAGGER_ENABLED = process.env.SWAGGER_UI === 'true';

// application init
const { dispose } = await start({
	port: PORT,
	prefix: BASE_URL,
	swagger: SWAGGER_ENABLED,
});

console.info(
	`\n  \u001B[32m➜\u001B[0m Local: \u001B[36mhttp://localhost:${PORT}/${BASE_URL}\u001B[0m\n`,
);

// hot module replacement
import.meta.hot?.accept();
import.meta.hot?.dispose(async () => {
	await dispose();
});
