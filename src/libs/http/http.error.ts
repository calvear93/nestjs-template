import { type HttpResponse } from './http.provider.ts';
import { HttpStatusCode } from './enums/http-status.enum.ts';

/**
 * Http Error.
 *
 * @remarks errors are critical problems should stop application, meanwhile
 *  exceptions are expected behavior on certain situations.
 */
export class HttpError extends Error {
	constructor(response: HttpResponse) {
		const statusCodeText = HttpStatusCode[response.status];

		super(
			`HTTP ${statusCodeText} error has ocurred calling ${response.url}`,
		);

		this.response = response;
		this.status = response.status;
		this.statusText = statusCodeText;
	}

	status: HttpStatusCode;

	statusText: string;

	response: HttpResponse;

	json<R = unknown>() {
		return this.response.json<R>();
	}
}
