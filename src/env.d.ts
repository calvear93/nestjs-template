declare global {
	namespace NodeJS {
		// NOTE: only string type is supported
		interface ProcessEnv {
			readonly NODE_ENV: 'development' | 'production' | 'test';
			readonly ENV: 'dev' | 'release';
			readonly DEBUG?: string;

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
			readonly SECURITY_ENABLED?: 'true' | 'false';
			readonly SECURITY_HEADER_NAME: string; // name of the api key header
			readonly SECURITY_API_KEY: string; // value of the api key header
		}
	}
}

export {};
