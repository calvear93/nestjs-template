import type { EnvName } from '@calvear/env';
import type appsettings from '../env/appsettings.json';
import type schema from '../env/settings/schema.json';

/**
 * process.env typed by @calvear/env from env/appsettings.json (every section,
 * environment and mode) and env/settings/schema.json (secrets and optional
 * files): a new variable goes there, not here. Booleans are 'false' | 'true'
 * and the rest string, numbers too (convert on read: +process.env.PORT).
 *
 * @see https://github.com/calvear93/env#-type-safe-env-variables-typescript
 */
declare module '@calvear/env' {
	interface EnvRegister {
		appsettings: typeof appsettings;
		// nestingDelimiter of env/settings/settings.json
		delimiter: '_';
		// Vite's default envPrefix: import.meta.env only gets VITE_* (and DEV…)
		envPrefix: 'VITE_';
		schema: typeof schema;
		// set outside @calvear/env, or narrower than the derived type
		overrides: {
			APP_ENV: EnvName<typeof appsettings>; // [[ENV]]: the environment
			NODE_ENV: 'development' | 'production' | 'test';
			DEBUG?: string;
		};
	}
}
