import { start } from './app/app.ts';

const PORT = +process.env.PORT;
const BASE_URL = process.env.BASE_URL;
const SWAGGER_ENABLED = process.env.SWAGGER_UI === 'true';
const SECURITY_ENABLED = process.env.SECURITY_ENABLED === 'true';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// application init
const { dispose } = await start({
	port: PORT,
	prefix: BASE_URL,
	swagger: SWAGGER_ENABLED,
});

console.info(
	`\n  \u001B[32m➜\u001B[0m Local: \u001B[36mhttp://localhost:${PORT}/${BASE_URL}\u001B[0m\n`,
);

// SECURITY.ENABLED is on by default, so reaching this in production means
// someone turned it off on purpose: say it loud instead of failing silently
if (!SECURITY_ENABLED && IS_PRODUCTION)
	console.warn(
		'  \u001B[31m⚠ SECURITY_ENABLED is off in production: @ApiKey() routes are open\u001B[0m\n',
	);

// hot module replacement
import.meta.hot?.accept();
import.meta.hot?.dispose(async () => {
	await dispose();
});
