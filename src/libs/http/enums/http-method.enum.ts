/**
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
 */
export enum HttpMethod {
	/**
	 * The `DELETE` method deletes the specified resource.
	 */
	DELETE = 'DELETE',

	/**
	 * The `GET` method requests a representation of the specified resource.
	 * Requests using GET should only retrieve data.
	 */
	GET = 'GET',

	/**
	 * The `HEAD` method asks for a response identical to that of a GET request,
	 * but without the response body.
	 */
	HEAD = 'HEAD',

	/**
	 * The `OPTIONS` method is used to describe the communication options for the
	 * target resource.
	 */
	OPTIONS = 'OPTIONS',

	/**
	 * The PATCH method is used to apply partial modifications to a resource.
	 */
	PATCH = 'PATCH',

	/**
	 * The `POST` method is used to submit an entity to the specified resource,
	 * often causing a change in state or side effects on the server.
	 */
	POST = 'POST',

	/**
	 * The `PUT` method replaces all current representations of the target
	 * resource with the request payload.
	 */
	PUT = 'PUT',

	/**
	 * The `QUERY` method requests that the origin server transmit an entity
	 * corresponding to a query, sent as the request body. Unlike POST it is
	 * intended to be safe and idempotent, like GET.
	 *
	 * @see https://www.ietf.org/archive/id/draft-ietf-httpbis-safe-method-w-body-latest.html
	 */
	QUERY = 'QUERY',

	/**
	 * The `TRACE` method performs a message loop-back test along the path to the
	 * target resource.
	 */
	TRACE = 'TRACE',
}
