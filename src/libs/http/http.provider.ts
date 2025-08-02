import type { FactoryProvider, InjectionToken } from '@nestjs/common';
import { HttpClient, type HttpClientConfig } from './http.client.ts';

/**
 * Http provider using fetch.
 * NOTE: import it in your context module at 'providers' array.
 *
 * @see https://docs.nestjs.com/providers
 */
export class HttpProvider extends HttpClient {
	static register(
		config?: HttpProviderConfig,
	): FactoryProvider<HttpProvider> {
		return {
			provide: config?.useToken ?? HttpProvider,
			useFactory: () => new HttpProvider(config),
		};
	}
}

export interface HttpProviderConfig extends HttpClientConfig {
	useToken?: InjectionToken;
}
