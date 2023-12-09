import { type HttpResponse } from '../http.provider.ts';
import { HttpStatusCode } from '../enums/http-status.enum.ts';

/**
 * Http Error.
 */
export class HttpError extends Error {
	constructor(readonly response: HttpResponse) {
		const { status, url } = response;
		const statusCodeText = HttpStatusCode[status];

		super(`HTTP ${statusCodeText} error has ocurred calling ${url}`);

		this.response = response;
		this.status = status;
		this.statusText = statusCodeText;
	}

	readonly status: HttpStatusCode;

	readonly statusText: string;

	json<R = unknown>() {
		return this.response.json<R>();
	}
}
