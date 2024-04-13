import { HttpStatusCode } from '../enums/http-status.enum.ts';
import { type HttpResponse } from '../http.client.ts';

/**
 * Http Error.
 */
export class HttpError extends Error {
	json<R = unknown>() {
		return this.response.json<R>();
	}

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
}
