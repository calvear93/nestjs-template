declare global {
	namespace NodeJS {
		// NOTE: only string type is supported
		interface ProcessEnv {
			readonly NODE_ENV: 'development' | 'production' | 'test';
			readonly ENV: 'dev' | 'release';
			readonly DEBUG?: string;

			// SECTION: runtime environment
			readonly HOSTNAME: string;

			// SECTION: project info from package.json
			readonly VERSION: string;
			readonly PROJECT: string;
			readonly NAME: string;
			readonly TITLE: string;
			readonly DESCRIPTION: string;

			// SECTION: base config
			readonly PORT: string;
			readonly API_PREFIX: string;
			readonly SWAGGER_UI: 'false' | 'true';

			// SECTION: localization
			readonly TZ: string;
			readonly LANG: string;
		}
	}

	// SECTION: global custom types

	type decimal = number;

	type seconds = number;

	type millis = number;

	type password = string;

	type bytes = number;

	type uuid = string;

	// unix timestamp, number of seconds that have elapsed since January 1, 1970
	type epoch = seconds;

	type AnyError = unknown;

	// https://en.wikipedia.org/wiki/ISO_8601#Durations
	type DurationISO8601 = string;
}

export {};
