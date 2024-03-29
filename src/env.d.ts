export declare global {
	type MODE = 'development' | 'production' | 'test';
	type ENV = 'dev' | 'release';

	namespace NodeJS {
		// NOTE: only string/literal type is supported,
		// numbers or booleans are loaded as string
		interface ProcessEnv {
			readonly NODE_ENV: MODE;
			readonly APP_ENV: ENV;
			readonly DEBUG?: string;

			// SECTION: project info from package.json
			readonly APP_VERSION: string;
			readonly APP_NAME: string;

			// SECTION: base
			readonly PORT: string;
			readonly BASE_URL: string;
			readonly SWAGGER_UI: 'false' | 'true';

			// SECTION: localization
			readonly TZ: string;
			readonly LANG: string;

			// SECTION: api security
			readonly SECURITY_ENABLED?: 'true' | 'false';
			readonly SECURITY_HEADER_NAME: string; // name of the api key header
			readonly SECURITY_API_KEY: string; // value of the api key header
		}
	}
}
