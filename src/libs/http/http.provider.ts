import axios from 'axios';
import type {
	AxiosError,
	AxiosInstance,
	AxiosRequestConfig,
	AxiosResponse,
	InternalAxiosRequestConfig,
} from 'axios';
import { FactoryProvider, Injectable, InjectionToken } from '@nestjs/common';

/**
 * Request interceptor.
 */
export interface AxiosRequestInterceptorUse {
	onFulfilled?: (
		value: AxiosRequestConfig,
	) =>
		| Promise<InternalAxiosRequestConfig<unknown>>
		| InternalAxiosRequestConfig<unknown>;

	onRejected?: (error: unknown) => Promise<unknown> | unknown | never;
}

/**
 * Response interceptor.
 */
export interface AxiosResponseInterceptorUse {
	onFulfilled?: (
		value: AxiosResponse,
	) => Promise<AxiosResponse<unknown>> | AxiosResponse<unknown>;

	onRejected?: (error: AxiosError) => Promise<unknown> | unknown | never;
}

export interface HttpProviderConfig extends AxiosRequestConfig {
	useToken?: InjectionToken;
}

/**
 * Interceptors config.
 *
 * @see https://axios-http.com/docs/interceptors
 */
export interface AxiosInterceptorConfig {
	request?: AxiosRequestInterceptorUse;
	response?: AxiosResponseInterceptorUse;
}

/**
 * Http provider using axios.
 * NOTE: import it in your context module at 'providers' array.
 *
 * @see https://axios-http.com/
 * @see https://docs.nestjs.com/providers
 */
@Injectable()
export class HttpProvider {
	/**
	 * Axios instance,
	 */
	private readonly _client: AxiosInstance;

	/**
	 * Creates an instance of HttpProvider.
	 *
	 * @see https://axios-http.com/docs/req_config
	 *
	 * @param config - axios config
	 * @param interceptors - request and response interceptors
	 */
	constructor(
		config?: AxiosRequestConfig,
		interceptors?: AxiosInterceptorConfig,
	) {
		this._client = axios.create(config);

		if (interceptors) {
			const { request, response } = interceptors;

			request &&
				this._client.interceptors.request.use(
					request.onFulfilled,
					request.onRejected,
				);

			response &&
				this._client.interceptors.response.use(
					response.onFulfilled,
					response.onRejected,
				);
		}
	}

	/**
	 * Returns axios instance.
	 */
	get axiosRef(): AxiosInstance {
		return this._client;
	}

	/**
	 * Makes a request.
	 *
	 * @typeParam R - response data
	 * @typeParam D - request/config body or data
	 * @param config - config object
	 *
	 * @throws AxiosError on http status code out of 2.x.x range
	 * @returns
	 */
	request<R, D = unknown>(
		config: AxiosRequestConfig<D>,
	): Promise<AxiosResponse<R, D>> | never | undefined {
		return this._client.request<R, AxiosResponse<R>, D>(config);
	}

	/**
	 * Makes a GET request.
	 *
	 * @typeParam R - response data
	 * @param url - request url
	 * @param config - axios config
	 *
	 * @throws AxiosError on http status code out of 2.x.x range
	 * @returns
	 */
	get<R>(
		url: string,
		config?: AxiosRequestConfig,
	): Promise<AxiosResponse<R>> {
		return this._client.get<R>(url, config);
	}

	/**
	 * Makes a POST request.
	 *
	 * @typeParam R - response data
	 * @typeParam B - request/config body
	 * @param url - request url
	 * @param body - request body
	 * @param config - axios config
	 *
	 * @throws AxiosError on http status code out of 2.x.x range
	 * @returns
	 */
	post<R, B = any>(
		url: string,
		body?: B,
		config?: AxiosRequestConfig,
	): Promise<AxiosResponse<R, unknown>> {
		return this._client.post<R>(url, body, config);
	}

	/**
	 * Makes a PUT request.
	 *
	 * @typeParam R - response data
	 * @typeParam B - request/config body
	 * @param url - request url
	 * @param body - request body
	 * @param config - axios config
	 *
	 * @throws AxiosError on http status code out of 2.x.x range
	 * @returns
	 */
	put<R, B = any>(
		url: string,
		body?: B,
		config?: AxiosRequestConfig,
	): Promise<AxiosResponse<R, unknown>> {
		return this._client.put<R>(url, body, config);
	}

	/**
	 * Makes a PATCH request.
	 *
	 * @typeParam R - response data
	 * @typeParam B - request/config body
	 * @param url - request url
	 * @param body - request body
	 * @param config - axios config
	 *
	 * @throws AxiosError on http status code out of 2.x.x range
	 * @returns
	 */
	patch<R, B = any>(
		url: string,
		body?: B,
		config?: AxiosRequestConfig,
	): Promise<AxiosResponse<R, unknown>> {
		return this._client.patch<R>(url, body, config);
	}

	/**
	 * Makes a DELETE request.
	 *
	 * @typeParam R - response data
	 * @param url - request url
	 * @param config - axios config
	 *
	 * @throws AxiosError on http status code out of 2.x.x range
	 * @returns
	 */
	delete<R>(
		url: string,
		config?: AxiosRequestConfig,
	): Promise<AxiosResponse<R>> {
		return this._client.delete<R>(url, config);
	}

	/**
	 * Makes a HEAD request.
	 *
	 * @typeParam R - response data
	 * @param url - request url
	 * @param config - axios config
	 *
	 * @throws AxiosError on http status code out of 2.x.x range
	 * @returns
	 */
	head<R>(
		url: string,
		config?: AxiosRequestConfig,
	): Promise<AxiosResponse<R>> {
		return this._client.head<R>(url, config);
	}

	/**
	 * Provider initializer for module.
	 *
	 * @param config - axios config and token
	 *  for handle multiple injected instances
	 * @param interceptors - request and response interceptors
	 *
	 * @returns provider
	 */
	static register(
		config?: HttpProviderConfig,
		interceptors?: AxiosInterceptorConfig,
	): FactoryProvider<HttpProvider> {
		return {
			provide: config?.useToken ?? HttpProvider,
			useFactory: () => new HttpProvider(config, interceptors),
		};
	}

	/**
	 * Validates if Error is AxiosError.
	 *
	 * @param error - Error object
	 * @returns whether input is an AxiosError
	 */
	static isAxiosError(error: unknown): error is AxiosError {
		return 'isAxiosError' in (error as AxiosError);
	}
}
