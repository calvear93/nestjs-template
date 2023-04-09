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

			// SECTION: base
			readonly PORT: string;
			readonly API_PREFIX: string;
			readonly SWAGGER_UI: 'false' | 'true';

			// SECTION: localization
			readonly TZ: string;
			readonly LANG: string;

			// SECTION: api security
			SECURITY_ENABLED?: 'true' | 'false';
			SECURITY_HEADER_NAME: string; // name of the api key header
			SECURITY_API_KEY: string; // value of the api key header
		}
	}

	// SECTION: built-in types tweaks
	interface JSON {
		parse<T = unknown>(
			text: string,
			reviver?: (this: any, key: string, value: any) => any,
		): T;
	}

	type ObjectKeys<T> = T extends object
		? (keyof T)[]
		: T extends number
		? []
		: T extends any[] | string
		? string[]
		: never;

	interface ObjectConstructor {
		keys<T>(o: T): ObjectKeys<T>;
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
