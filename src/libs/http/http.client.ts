import { HttpMethod } from './enums/http-method.enum.ts';
import { HttpStatusCode } from './enums/http-status.enum.ts';
import { HttpError } from './errors/http.error.ts';
import { TimeoutError } from './errors/timeout.error.ts';

type Primitive = bigint | boolean | number | string | null | undefined;

type RequestOptions = Omit<RequestInit, 'signal' | 'window'>;

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
		this._serializeBody(config);
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
		if (this._throwOnClientError && !response.ok)
			throw new HttpError(response);

		return response;
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
	 * Creates an instance of HttpCLient.
	 *
	 * @param config - fetch config and url (base url)
	 */
	constructor(config?: HttpClientConfig) {
		if (config) {
			const { throwOnClientError = true, url, ...cfg } = config;

			this._baseUrl = url?.endsWith('/') ? url : `${url}/`;
			this._throwOnClientError = throwOnClientError;
			this._baseConfig = {
				cache: 'no-cache',
				...cfg,
			};
		}

		this._timeoutReason = new TimeoutError();
	}

	/**
	 * Client base config.
	 */
	private readonly _baseConfig?: HttpRequestOptions;

	/**
	 * Client base URL.
	 */
	private readonly _baseUrl?: RequestURL;

	/**
	 * When true, throws HttpError if a client error occurs (4XX).
	 */
	private readonly _throwOnClientError?: boolean;

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
}

export interface HttpRequestOptions extends RequestOptions {
	cancel?: AbortController;
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
