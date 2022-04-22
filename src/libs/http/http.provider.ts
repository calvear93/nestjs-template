import { Injectable, Provider } from '@nestjs/common';
import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse
} from 'axios';

/**
 * Request interceptor.
 *
 * @export
 * @interface AxiosRequestInterceptorUse
 */
export interface AxiosRequestInterceptorUse {
    onFulfilled?: (
        value: AxiosRequestConfig
    ) => Promise<AxiosRequestConfig<unknown>> | AxiosRequestConfig<unknown>;

    onRejected?: (error: unknown) => Promise<unknown> | unknown | never;
}

/**
 * Response interceptor.
 *
 * @export
 * @interface AxiosResponseInterceptorUse
 */
export interface AxiosResponseInterceptorUse {
    onFulfilled?: (
        value: AxiosResponse
    ) => Promise<AxiosResponse<unknown>> | AxiosResponse<unknown>;

    onRejected?: (error: AxiosError) => Promise<unknown> | unknown | never;
}

/**
 * Interceptors config.
 *
 * @see https://axios-http.com/docs/interceptors
 *
 * @export
 * @interface AxiosInterceptorConfig
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
 *
 * @class HttpProvider
 */
@Injectable()
export class HttpProvider {
    /**
     * Axios instance,
     *
     * @private
     * @type {AxiosInstance}
     */
    private readonly _client: AxiosInstance;

    /**
     * Creates an instance of HttpProvider.
     *
     * @see https://axios-http.com/docs/req_config
     *
     * @param {AxiosRequestConfig} [config] axios config
     * @param {AxiosInterceptorConfig} [interceptors] request and response interceptors
     */
    constructor(
        config?: AxiosRequestConfig,
        interceptors?: AxiosInterceptorConfig
    ) {
        this._client = axios.create(config);

        if (interceptors) {
            const { request, response } = interceptors;

            request &&
                this._client.interceptors.request.use(
                    request.onFulfilled,
                    request.onRejected
                );

            response &&
                this._client.interceptors.response.use(
                    response.onFulfilled,
                    response.onRejected
                );
        }
    }

    /**
     * Returns axios instance.
     *
     * @readonly
     * @type {AxiosInstance}
     */
    get axiosRef(): AxiosInstance {
        return this._client;
    }

    /**
     * Makes a request.
     *
     * @template R response data
     * @template D request/config body or data
     * @param {AxiosRequestConfig} config
     *
     * @throws {AxiosError} on http status code out of 2.x.x range
     * @returns {Promise<AxiosResponse<R>> | never}
     */
    request<R, D = unknown>(
        config: AxiosRequestConfig
    ): Promise<AxiosResponse<R, D>> | never {
        return this._client.request<R, AxiosResponse<R>, D>(config);
    }

    /**
     * Makes a GET request.
     *
     * @template R response data
     * @param {string} url
     * @param {AxiosRequestConfig} [config]
     *
     * @throws {AxiosError} on http status code out of 2.x.x range
     * @returns {Promise<AxiosResponse<R>> | never}
     */
    get<R>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<R>> {
        return this._client.get<R>(url, config);
    }

    /**
     * Makes a POST request.
     *
     * @template R response data
     * @template B request/config body
     * @param {string} url
     * @param {B} body body
     * @param {AxiosRequestConfig} [config]
     *
     * @throws {AxiosError} on http status code out of 2.x.x range
     * @returns {Promise<AxiosResponse<R>> | never}
     */
    post<R, B = any>(
        url: string,
        body?: B,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<R, unknown>> {
        return this._client.post<R>(url, body, config);
    }

    /**
     * Makes a PUT request.
     *
     * @template R response data
     * @template B request/config body
     * @param {string} url
     * @param {B} body body
     * @param {AxiosRequestConfig} [config]
     *
     * @throws {AxiosError} on http status code out of 2.x.x range
     * @returns {Promise<AxiosResponse<R>> | never}
     */
    put<R, B = any>(
        url: string,
        body?: B,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<R, unknown>> {
        return this._client.put<R>(url, body, config);
    }

    /**
     * Makes a PATCH request.
     *
     * @template R response data
     * @template B request/config body
     * @param {string} url
     * @param {D} body body
     * @param {AxiosRequestConfig} [config]
     *
     * @throws {AxiosError} on http status code out of 2.x.x range
     * @returns {Promise<AxiosResponse<R>> | never}
     */
    patch<R, B = any>(
        url: string,
        body?: B,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<R, unknown>> {
        return this._client.patch<R>(url, body, config);
    }

    /**
     * Makes a DELETE request.
     *
     * @template R response data
     * @param {string} url
     * @param {AxiosRequestConfig} [config]
     *
     * @throws {AxiosError} on http status code out of 2.x.x range
     * @returns {Promise<AxiosResponse<R>> | never}
     */
    delete<R>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<R>> {
        return this._client.delete<R>(url, config);
    }

    /**
     * Makes a HEAD request.
     *
     * @template R response data
     * @param {string} url
     * @param {AxiosRequestConfig} [config]
     *
     * @throws {AxiosError} on http status code out of 2.x.x range
     * @returns {Promise<AxiosResponse<R>> | never}
     */
    head<R>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<R>> {
        return this._client.head<R>(url, config);
    }

    /**
     * Provider initializer for module.
     *
     * @static
     * @param {AxiosRequestConfig} [config] axios config and useToken
     *  for handle multiple injected instances
     * @param {AxiosInterceptorConfig} [interceptors] request and response interceptors
     *
     * @returns {Provider} provider
     */
    static register(
        config?: AxiosRequestConfig & { useToken?: string },
        interceptors?: AxiosInterceptorConfig
    ): Provider<HttpProvider> {
        return {
            provide: config?.useToken ?? HttpProvider,
            useFactory: () => new HttpProvider(config, interceptors)
        };
    }

    /**
     * Validates if Error is AxiosError.
     *
     * @static
     * @param {any} error
     * @returns {is AxiosError} whether input is an AxiosError
     */
    static isAxiosError(error: any): error is AxiosError {
        return 'isAxiosError' in error;
    }
}
