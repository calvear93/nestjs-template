import type { FactoryProvider, InjectionToken } from '@nestjs/common';
import { HttpStatusCode } from './index.ts';
import { TimeoutError } from './errors/timeout.error.ts';
import { HttpError } from './errors/http.error.ts';
import { HttpMethod } from './enums/http-method.enum.ts';

type Primitive = string | number | boolean | bigint | null | undefined;
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
			const { throwOnClientError = true, url, ...cfg } = config;

			this._baseUrl = url?.endsWith('/') ? url : `${url}/`;
			this._throwOnError = throwOnClientError;
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
		options?: HttpRequestOptions,
	): Promise<HttpResponse<R>> | never {
		let clrFn: NodeJS.Timeout | null = null;
		const { query, timeout, ...config } = {
			...this._baseConfig,
			...options,
			headers: {
				...this._baseConfig?.headers,
				...options?.headers,
			},
		};

		if (timeout) {
			config.cancel ??= new AbortController();

			clrFn = setTimeout(() => {
				config.cancel!.abort(this._timeoutReason);
			}, timeout);
		}

		// sets fetch cancel signal from abort controller
		(config as RequestInit).signal ??= config.cancel?.signal;

		const fullUrl = this._getFullUrl(url.toString(), query);
		const response = await fetch(fullUrl, config).catch((error) => {
			if (error instanceof TypeError) {
				throw new HttpError({
					json: () => Promise.resolve(error.message),
					ok: false,
					status: HttpStatusCode.BAD_GATEWAY,
					url,
				} as HttpResponse);
			}

			throw error;
		});

		if (clrFn) clearTimeout(clrFn);
		if (this._throwOnError && !response.ok) throw new HttpError(response);

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
	 * Merges and normalizes request URL.
	 *
	 * @param path - request path
	 * @param query - query params
	 */
	private _getFullUrl(path: string, query?: Record<string, Primitive>) {
		if (path.startsWith('/')) {
			path = path.slice(1);
		}

		path = `${path}${this._buildQuery(query)}`;

		return new URL(path, this._baseUrl);
	}

	/**
	 * Merges and normalizes request URL.
	 *
	 * @param query - query params
	 */
	private _buildQuery(query?: Record<string, Primitive>) {
		if (!query) return '';

		return `?${Object.keys(query)
			.map((key) => {
				const value = query[key];

				if (!value) return '';

				return `${key}=${query[key]}`;
			})
			.join('&')}`;
	}

	/**
	 * Serializes "data" property from
	 * config into "body" and adds json content type.
	 *
	 * @param config - fetch config
	 */
	private _serializeBody(config: HttpRequestBodyOptions = {}) {
		if (config.data instanceof URLSearchParams) {
			config.body = config.data;
			config.headers = {
				'content-type':
					'application/x-www-form-urlencoded;charset=utf-8',
				...config.headers,
			};
		} else if (typeof config.data === 'object') {
			config.body = JSON.stringify(config.data);
			config.headers = {
				'content-type': 'application/json;charset=utf-8',
				...config.headers,
			};
		}
	}

	/**
	 * Client base URL.
	 */
	private readonly _baseUrl?: RequestURL;

	/**
	 * If not ok response throw HttpError.
	 */
	private readonly _throwOnError?: boolean;

	/**
	 * Client base config.
	 */
	private readonly _baseConfig?: HttpRequestOptions;

	/**
	 * Reason for timeout
	 */
	private readonly _timeoutReason: TimeoutError;

	/**
	 * Encodes user and password for basic auth.
	 *
	 * @param user - user name
	 * @param password - user password
	 *
	 * @returns base64 encoded basic auth
	 */
	static basicAuth(user: string, password: string) {
		return Buffer.from(`${user}:${password}`, 'utf8').toString('base64url');
	}

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
		config?: HttpProviderConfig & { token?: InjectionToken },
	): FactoryProvider<HttpProvider> {
		return {
			provide: config?.token ?? HttpProvider,
			useFactory: () => new HttpProvider(config),
		};
	}
}

export interface HttpRequestOptions extends RequestOptions {
	query?: Record<string, Primitive>;
	timeout?: millis;
	cancel?: AbortController;
}

export interface HttpRequestBodyOptions extends HttpRequestOptions {
	data?: object;
}

export interface HttpProviderConfig extends HttpRequestOptions {
	url?: string;
	throwOnClientError?: boolean;
}

export interface HttpResponse<R = unknown> extends Response {
	json<J = R>(): Promise<J>;
}
