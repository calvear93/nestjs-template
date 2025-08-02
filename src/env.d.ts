export declare global {
	type MODE = 'development' | 'production' | 'test';
	type ENV = 'dev' | 'release';

	namespace NodeJS {
		// NOTE: only string/literal type is supported,
		// numbers or booleans are loaded as string
		interface ProcessEnv {
			readonly APP_ENV: ENV;
			readonly NODE_ENV: MODE;
			readonly DEBUG?: string;

			// SECTION: project info from package.json
			readonly APP_NAME: string;
			readonly APP_VERSION: string;

			// SECTION: base
			readonly BASE_URL: string;
			readonly PORT: string;
			readonly SWAGGER_UI: 'false' | 'true';

			// SECTION: localization
			readonly LANG: string;
			readonly TZ: string;

			// SECTION: api security
			readonly SECURITY_API_KEY: string; // value of the api key header
			readonly SECURITY_HEADER_NAME: string; // name of the api key header
			readonly SECURITY_ENABLED?: 'false' | 'true';
		}
	}
}
