import type { FactoryProvider, InjectionToken } from '@nestjs/common';
import { TimeoutError } from './errors/timeout.error.ts';
import { HttpError } from './errors/http.error.ts';
import { HttpMethod } from './enums/http-method.enum.ts';

type RequestOptions = Omit<RequestInit, 'signal' | 'window'>;

export type RequestURL = string | URL;

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
	 * @param config - fetch config and url (base url)
	 */
	constructor(config?: HttpProviderConfig) {
		if (config) {
			const { url, ...cfg } = config;

			this._baseUrl = url;
			this._baseConfig = {
				cache: 'no-cache',
				...cfg,
			};
		}

		this._timeoutReason = new TimeoutError();
	}

	/**
	 * Makes a request.
	 *
	 * @typeParam R - response data
	 * @param config - config object
	 *
	 * @throws HttpError on http status code greater than 2.x.x
	 * @returns async response
	 */
	async request<R = unknown>(
		url: RequestURL,
		{ query, timeout, ...config }: HttpRequestOptions = {},
	): Promise<HttpResponse<R>> | never {
		if (timeout) {
			config.cancel ??= new AbortController();

			const requestTimeout = setTimeout(() => {
				config.cancel!.abort(this._timeoutReason);
				clearTimeout(requestTimeout);
			}, timeout);
		}

		// sets fetch cancel signal from abort controller
		(config as RequestInit).signal ??= config.cancel?.signal;

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
	 * @returns async response
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
	 * @returns async response
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
	 * @returns async response
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
	 * @returns async response
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
	 * @returns async response
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
				'content-type': 'application/json;charset=UTF-8',
				...config.headers,
			};
		}
	}

	/**
	 * Client base URL.
	 */
	private readonly _baseUrl?: RequestURL;

	/**
	 * Client base config.
	 */
	private readonly _baseConfig?: HttpRequestOptions;

	/**
	 * Reason for timeout
	 */
	private readonly _timeoutReason: TimeoutError;

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
		config?: HttpProviderConfig & { useToken?: InjectionToken },
	): FactoryProvider<HttpProvider> {
		return {
			provide: config?.useToken ?? HttpProvider,
			useFactory: () => new HttpProvider(config),
		};
	}
}

export interface HttpRequestOptions extends RequestOptions {
	query?: Record<string, string>;
	timeout?: millis;
	cancel?: AbortController;
}

export interface HttpRequestBodyOptions extends HttpRequestOptions {
	data?: object;
}

export interface HttpProviderConfig extends HttpRequestOptions {
	url?: RequestURL;
}

export interface HttpResponse<R = unknown> extends Response {
	json<J = R>(): Promise<J>;
}
