import {
	type DynamicModule,
	type InjectionToken,
	Module,
} from '@nestjs/common';
import { HttpClient, type HttpClientConfig } from './http.client.ts';

/**
 * HttpModule.
 * NOTE: import it in your context module at 'imports' array.
 *
 * @see https://docs.nestjs.com/modules
 */
@Module({})
export class HttpModule {
	/**
	 * Registers the module with configuration.
	 *
	 * @param config - provider config
	 * @returns module registration
	 */
	static register(config?: HttpModuleConfig): DynamicModule {
		const injectionToken = config?.useToken ?? HttpClient;

		return {
			exports: [injectionToken],
			global: config?.global,
			module: HttpModule,
			providers: [
				{
					provide: injectionToken,
					useValue: new HttpClient(config),
				},
			],
		};
	}
}

export interface HttpModuleConfig extends HttpClientConfig {
	global?: boolean;
	useToken?: InjectionToken;
}
