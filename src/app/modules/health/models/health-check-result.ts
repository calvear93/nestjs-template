/**
 * The result object of a health indicator
 */
export type HealthIndicatorResult = Record<
	string,
	{
		status: 'up' | 'down';

		[optionalKeys: string]: any;
	}
>;

/**
 * The result of a health check
 */
export interface HealthCheckResult {
	status: 'error' | 'ok' | 'shutting_down';

	/**
	 * The info object contains information of each health indicator
	 * which is of status "up"
	 */
	info?: HealthIndicatorResult;

	/**
	 * The error object contains information of each health indicator
	 * which is of status "down"
	 */
	error?: HealthIndicatorResult;

	/**
	 * The details object contains information of every health indicator.
	 */
	details?: HealthIndicatorResult;
}
