import type { FactoryProvider, InjectionToken } from '@nestjs/common';
import { HttpError } from './http.error.ts';
import { HttpMethod } from './enums/http-method.enum.ts';

export type RequestURL = string | URL;

export interface HttpRequestOptions extends RequestInit {
	query?: Record<string, string>;
}

export interface HttpRequestBodyOptions extends HttpRequestOptions {
	data?: object;
}

export interface HttpProviderConfig extends Omit<HttpRequestOptions, 'body'> {
	url?: RequestURL;
	useToken?: InjectionToken;
}

export interface HttpResponse<R = unknown> extends Response {
	json<J = R>(): Promise<J>;
}

/**
 * Http provider using fetch.
 * NOTE: import it in your context module at 'providers' array.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 * @see https://developer.mozilla.org/en-US/docs/Web/API/fetch
 * @see https://docs.nestjs.com/providers
 */
export class HttpProvider {
	/**
	 * Creates an instance of HttpProvider.
	 *
	 * @param config - fetch config
	 */
	constructor(config?: HttpRequestOptions & { url?: RequestURL }) {
		if (config) {
			const { url, ...cfg } = config;

			this._baseUrl = url ?? '';
			this._baseConfig = {
				cache: 'no-cache',
				...cfg,
			};
		}
	}

	/**
	 * Makes a request.
	 *
	 * @typeParam R - response data
	 * @param config - config object
	 *
	 * @throws HttpError on http status code greater than 2.x.x
	 * @returns HttpResponse<R>
	 */
	async request<R = unknown>(
		url: RequestURL,
		{ query, ...config }: HttpRequestOptions = {},
	): Promise<HttpResponse<R>> | never {
		const response = await fetch(
			new URL(
				query ? `?${new URLSearchParams(query)}` : url,
				this._baseUrl,
			),
			{
				...this._baseConfig,
				...config,
			},
		);

		if (!response.ok) throw new HttpError(response);

		return response;
	}

	/**
	 * Makes a GET request.
	 *
	 * @typeParam R - response data
	 * @param url - request url
	 * @param config - fetch config
	 *
	 * @throws HttpError on http status code greater than 2.x.x
	 * @returns HttpResponse<R>
	 */
	get<R>(
		url: RequestURL,
		config: HttpRequestOptions = {},
	): Promise<HttpResponse<R>> | never {
		config.method = HttpMethod.GET;

		return this.request(url, config);
	}

	/**
	 * Makes a POST request.
	 *
	 * @typeParam R - response data
	 * @param url - request url
	 * @param config - fetch config
	 *
	 * @throws HttpError on http status code greater than 2.x.x
	 * @returns HttpResponse<R>
	 */
	post<R>(
		url: RequestURL,
		config: HttpRequestBodyOptions = {},
	): Promise<HttpResponse<R>> | never {
		this._serializeBody(config);
		config.method = HttpMethod.POST;

		return this.request(url, config);
	}

	/**
	 * Makes a PUT request.
	 *
	 * @typeParam R - response data
	 * @param url - request url
	 * @param config - fetch config
	 *
	 * @throws HttpError on http status code greater than 2.x.x
	 * @returns HttpResponse<R>
	 */
	put<R>(
		url: RequestURL,
		config: HttpRequestBodyOptions = {},
	): Promise<HttpResponse<R>> | never {
		this._serializeBody(config);
		config.method = HttpMethod.PUT;

		return this.request(url, config);
	}

	/**
	 * Makes a PATCH request.
	 *
	 * @typeParam R - response data
	 * @param url - request url
	 * @param config - fetch config
	 *
	 * @throws HttpError on http status code greater than 2.x.x
	 * @returns HttpResponse<R>
	 */
	patch<R>(
		url: RequestURL,
		config: HttpRequestBodyOptions = {},
	): Promise<HttpResponse<R>> | never {
		this._serializeBody(config);
		config.method = HttpMethod.PATCH;

		return this.request(url, config);
	}

	/**
	 * Makes a DELETE request.
	 *
	 * @typeParam R - response data
	 * @param url - request url
	 * @param config - fetch config
	 *
	 * @throws HttpError on http status code greater than 2.x.x
	 * @returns HttpResponse<R>
	 */
	delete<R>(
		url: RequestURL,
		config: HttpRequestOptions = {},
	): Promise<HttpResponse<R>> | never {
		config.method = HttpMethod.DELETE;

		return this.request(url, config);
	}

	/**
	 * Serializes "data" property from
	 * config into "body" and adds json content type.
	 *
	 * @param config - fetch config
	 */
	private _serializeBody(config: HttpRequestBodyOptions = {}) {
		if (typeof config.data === 'object') {
			config.body = JSON.stringify(config.data);
			config.headers = {
				'content-type': 'application/json',
				...config.headers,
			};
		}
	}

	/**
	 * Client base URL.
	 */
	private readonly _baseUrl: RequestURL;

	/**
	 * Client base config.
	 */
	private readonly _baseConfig?: HttpRequestOptions;

	/**
	 * Provider initializer for module.
	 *
	 * @param config - fetch config and token
	 *  for handle multiple injected instances
	 * @param interceptors - request and response interceptors
	 *
	 * @returns provider
	 */
	static register(
		config?: HttpProviderConfig,
	): FactoryProvider<HttpProvider> {
		return {
			provide: config?.useToken ?? HttpProvider,
			useFactory: () => new HttpProvider(config),
		};
	}
}
