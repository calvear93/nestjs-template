/**
 * The result object of a health indicator
 *
 * @export
 * @type HealthIndicatorResult
 */
export declare type HealthIndicatorResult = {
    [key: string]: {
        status: 'up' | 'down';

        [optionalKeys: string]: any;
    };
};

/**
 * The result of a health check
 *
 * @export
 * @interface HealthCheckResult
 */
export interface HealthCheckResult {
    status: 'error' | 'ok' | 'shutting_down';

    /**
     * The info object contains information of each health indicator
     * which is of status "up"
     *
     * @type {HealthIndicatorResult}
     * @memberof HealthCheckResult
     */
    info?: HealthIndicatorResult;

    /**
     * The error object contains information of each health indicator
     * which is of status "down"
     *
     * @type {HealthIndicatorResult}
     * @memberof HealthCheckResult
     */
    error?: HealthIndicatorResult;

    /**
     * The details object contains information of every health indicator.
     *
     * @type {HealthIndicatorResult}
     * @memberof HealthCheckResult
     */
    details?: HealthIndicatorResult;
}
