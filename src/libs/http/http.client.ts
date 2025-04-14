import { HttpMethod } from './enums/http-method.enum.ts';
import { HttpStatusCode } from './enums/http-status.enum.ts';
import { HttpError } from './errors/http.error.ts';
import { TimeoutError } from './errors/timeout.error.ts';

type Primitive = bigint | boolean | number | string | null | undefined;

export type OnRequestInterceptor = (
	options: HttpRequestOptions,
	url: RequestURL,
) => Promise<void> | void;

export type RequestURL = URL | string;

/**
 * Http client using fetch.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 * @see https://developer.mozilla.org/en-US/docs/Web/API/fetch
 */
export class HttpClient {
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
		this.#serializeBody(config);
		config.method = HttpMethod.PATCH;

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
		this.#serializeBody(config);
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
		this.#serializeBody(config);
		config.method = HttpMethod.PUT;

		return this.request(url, config);
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
		const mergedConfig = {
			...this.#baseConfig,
			...options,
			headers: {
				...this.#baseConfig?.headers,
				...options?.headers,
			},
		};

		await mergedConfig.onRequest?.(mergedConfig, url);

		const { query, timeout, ...config } = mergedConfig;

		if (timeout) {
			config.cancel ??= new AbortController();

			clrFn = setTimeout(() => {
				config.cancel!.abort(new TimeoutError());
			}, timeout);
		}
		// sets fetch cancel signal from abort controller
		(config as RequestInit).signal ??= config.cancel?.signal;

		const response = await fetch(
			this.#getFullUrl(url.toString(), query),
			config,
		).catch((error) => {
			if (error instanceof TypeError) {
				throw new HttpError({
					ok: false,
					status: HttpStatusCode.BAD_GATEWAY,
					url,
					json: () => Promise.resolve(error.message),
				} as HttpResponse);
			}

			throw error;
		});

		if (clrFn) clearTimeout(clrFn);
		if (this.#throwOnClientError && !response.ok)
			throw new HttpError(response as HttpResponse);

		return response as HttpResponse;
	}

	/**
	 * Sets a header value.
	 *
	 * @param key
	 * @param value
	 */
	setHeader(key: string, value: string): void {
		this.#baseConfig.headers ??= {};
		this.#baseConfig.headers[key] = value;
	}

	/**
	 * Merges and normalizes request URL.
	 *
	 * @param query - query params
	 */
	#buildQuery(query?: Record<string, Primitive>) {
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
	 * Merges and normalizes request URL.
	 *
	 * @param path - request path
	 * @param query - query params
	 */
	#getFullUrl(path: string, query?: Record<string, Primitive>) {
		if (path.startsWith('/')) {
			path = path.slice(1);
		}

		path = `${path}${this.#buildQuery(query)}`;

		return new URL(path, this.#baseUrl);
	}

	/**
	 * Serializes "data" property from
	 * config into "body" and adds json content type.
	 *
	 * @param config - fetch config
	 */
	#serializeBody(config: HttpRequestBodyOptions = {}) {
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
	 * Creates an instance of HttpCLient.
	 *
	 * @param config - fetch config and url (base url)
	 */
	constructor(config?: HttpClientConfig) {
		if (config) {
			const { throwOnClientError = true, url, ...cfg } = config;

			if (url) this.#baseUrl = url?.endsWith('/') ? url : `${url}/`;
			this.#throwOnClientError = throwOnClientError;
			this.#baseConfig = cfg;
		}
	}

	/**
	 * Client base config.
	 */
	#baseConfig: HttpRequestOptions = {};

	/**
	 * Client base URL.
	 */
	readonly #baseUrl?: RequestURL;

	/**
	 * When true, throws HttpError if a client error occurs (4XX).
	 */
	readonly #throwOnClientError?: boolean;

	/**
	 * Returns base config.
	 *
	 * @returns base config object
	 */
	get config(): HttpRequestOptions {
		return this.#baseConfig;
	}

	/**
	 * Merges base config object.
	 *
	 * @param partialConfig - new config for merge
	 */
	set config(partialConfig: Partial<HttpRequestOptions>) {
		this.#baseConfig = {
			...this.#baseConfig,
			...partialConfig,
		};
	}

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
}

export interface HttpRequestOptions
	extends Omit<RequestInit, 'signal' | 'window'> {
	cancel?: AbortController;
	headers?: Record<string, string>;
	onRequest?: OnRequestInterceptor;
	query?: Record<string, Primitive>;
	timeout?: millis;
}

export interface HttpRequestBodyOptions extends HttpRequestOptions {
	data?: object;
}

export interface HttpClientConfig extends HttpRequestOptions {
	// when true, throws HttpError if a client error occurs (4XX).
	throwOnClientError?: boolean;
	// base url
	url?: string;
}

export interface HttpResponse<R = unknown> extends Response {
	json<J = R>(): Promise<J>;
}
