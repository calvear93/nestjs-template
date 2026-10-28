import type { NestApplicationOptions } from '@nestjs/common';

type CorsConfig = NestApplicationOptions['cors'];

/**
 * Builds the CORS configuration from a comma separated allow-list of
 * origins (CORS_ORIGINS).
 *
 * An empty list turns CORS off: the browser then blocks cross-origin calls,
 * while server to server calls are unaffected because CORS only binds
 * browsers. Origins are compared exactly (scheme, host and port), so write
 * them without a trailing slash.
 *
 * @example
 * ```ts
 *  corsFrom('http://localhost:5173, https://app.example.com');
 *  // { origin: ['http://localhost:5173', 'https://app.example.com'] }
 *
 *  corsFrom('');
 *  // false
 * ```
 *
 * @param origins - comma separated origins, i.e. process.env.CORS_ORIGINS
 *
 * @returns the `cors` option for `NestFactory.create`
 */
export const corsFrom = (origins = ''): CorsConfig => {
	const allowed = origins
		.split(',')
		.map((origin) => origin.trim())
		.filter(Boolean);

	return allowed.length > 0 ? { origin: allowed } : false;
};
