/**
 * Timeout Error.
 */
export class TimeoutError extends Error {
	constructor() {
		super('HTTP request timeout');
	}
}
