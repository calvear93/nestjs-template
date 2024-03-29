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
		config?: HttpClientConfig & { token?: InjectionToken },
	): FactoryProvider<HttpProvider> {
		return {
			provide: config?.token ?? HttpProvider,
			useFactory: () => new HttpProvider(config),
		};
	}
}
