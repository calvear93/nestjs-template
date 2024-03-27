/**
 * @see https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */
export enum HttpStatusCode {
	/** SECTION: 1xx informational response – the request was received, continuing process */

	/**
	 * server has received the request headers and the client
	 * should proceed to send the request body.
	 * (417 Expectation Failed indicates the request should not be continued)
	 */
	CONTINUE = 100,
	/**
	 * the requester has asked the server to switch protocols and the
	 * server has agreed to do so.
	 */
	SWITCHING_PROTOCOLS = 101,

	/**
	 * the server has received and is processing the request,
	 * but no response is available yet.
	 */
	PROCESSING = 102,
	/**
	 * return some response headers before final HTTP message
	 */
	EARLY_HINTS = 103,

	/** SECTION: 2xx successful – the request was successfully received, understood, and accepted */

	/**
	 * the request is successful.
	 */
	OK = 200,
	/**
	 * the request has been fulfilled,
	 * resulting in the creation of a new resource.
	 */
	CREATED = 201,
	/**
	 * the request has been accepted for processing,
	 * but the processing has not been completed.
	 */
	ACCEPTED = 202,
	/**
	 * the server is a transforming proxy that received
	 * a 200 OK from its origin, but is returning
	 * modified version of the origin's response.
	 */
	NON_AUTHORITATIVE_INFORMATION = 203,
	/**
	 * the server successfully processed the request
	 * and is not returning any content.
	 */
	NO_CONTENT = 204,
	/**
	 * the server successfully processed the request,
	 * but is not returning any content.
	 * Unlike a 204 response, this response requires
	 * that the requester reset the document view.
	 */
	RESET_CONTENT = 205,
	/**
	 * the server is delivering only part of the resource
	 * (byte serving) due to a range header sent by the client.
	 * The range header is used by HTTP clients to enable
	 * resuming of interrupted downloads, or split a download
	 * into multiple simultaneous streams.
	 */
	PARTIAL_CONTENT = 206,
	/**
	 * the message body that follows is an XML message and can
	 * contain a number of separate response codes, depending
	 * on how many sub-requests were made.
	 */
	MULTI_STATUS = 207,
	/**
	 * the members of a DAV binding have already been enumerated
	 * in a preceding part of the (multistatus) response,
	 * and are not being included again.
	 */
	ALREADY_REPORTED = 208,
	/**
	 * the server has fulfilled a request for the resource,
	 * and the response is a representation of the result of one
	 * or more instance-manipulations applied to the current instance.
	 */
	IM_USED = 226,

	/** SECTION: 3xx redirection – further action needs to be taken in order to complete the request */

	/**
	 * multiple options for the resource from which the client
	 * may choose (via agent-driven content negotiation).
	 */
	MULTIPLE_CHOICES = 300,
	/**
	 * this and all future requests should be directed to the given URI.
	 */
	MOVED_PERMANENTLY = 301,
	/**
	 * @deprecated
	 * prefer MOVED_PERMANENTLY instead.
	 * tells the client to look at (browse to) another URL.
	 */
	FOUND = 302,
	/**
	 * the response to the request can be found under
	 * another URI using a GET method.
	 */
	SEE_OTHER = 303,
	/**
	 * the resource has not been modified since the version specified
	 * by the request headers If-Modified-Since or If-None-Match.
	 * in such case, there is no need to retransmit the resource since
	 * the client still has a previously-downloaded copy.
	 */
	NOT_MODIFIED = 304,
	/**
	 * the requested resource is available only through a proxy,
	 * the address for which is provided in the response.
	 */
	USE_PROXY = 305,
	/**
	 * @deprecated
	 * originally meant "Subsequent requests should use the specified proxy."
	 */
	SWITCH_PROXY = 306,
	/**
	 * the request should be repeated with another URI, however,
	 * future requests should still use the original URI.
	 */
	TEMPORARY_REDIRECT = 307,
	/**
	 * the request and all future requests should be repeated using another URI.
	 * 307 and 308 parallel the behaviors of 302 and 301, but do not allow the HTTP method to change.
	 */
	PERMANENT_REDIRECT = 308,

	/** SECTION: 4xx client error – the request contains bad syntax or cannot be fulfilled */

	/**
	 * server cannot or will not process the request
	 * due to an apparent client error.
	 * (e.g., malformed request syntax, too large size,
	 * invalid request message framing, or deceptive request routing).
	 */
	BAD_REQUEST = 400,
	/**
	 * similar to 403 Forbidden, but specifically for use when authentication
	 * is required and has failed or has not yet been provided.
	 * means "unauthenticated"
	 */
	UNAUTHORIZED = 401,
	/**
	 * reserved for future use.
	 * this code might be used as part of some form of digital
	 * cash or micro payment scheme, but is not usually used.
	 */
	PAYMENT_REQUIRED = 402,
	/**
	 * the request was valid, but the server is refusing action.
	 * the user might not have the necessary permissions for a resource.
	 * means "access denied"
	 */
	FORBIDDEN = 403,
	/**
	 * the requested resource could not be found
	 * but may be available in the future.
	 */
	NOT_FOUND = 404,
	/**
	 * method is not supported for the requested resource.
	 */
	METHOD_NOT_ALLOWED = 405,
	/**
	 * the requested resource is capable of generating only content
	 * not acceptable according to the Accept headers sent in the request.
	 */
	NOT_ACCEPTABLE = 406,
	/**
	 * the client must first authenticate itself with the proxy.
	 */
	PROXY_AUTHENTICATION_REQUIRED = 407,
	/**
	 * server timed out waiting for the request.
	 */
	REQUEST_TIMEOUT = 408,
	/**
	 * the request could not be processed because of conflict in the request,
	 * such as an edit conflict between multiple simultaneous updates.
	 */
	CONFLICT = 409,
	/**
	 * the resource requested is no longer available
	 * and will not be available again.
	 */
	GONE = 410,
	/**
	 * the request did not specify the length of its content,
	 * which is required by the requested resource.
	 */
	LENGTH_REQUIRED = 411,
	/**
	 * server does not meet one of the preconditions
	 * that the requester put on the request.
	 */
	PRECONDITION_FAILED = 412,
	/**
	 * request is larger than the server is willing or able to process.
	 * previously called "Request Entity Too Large".
	 */
	PAYLOAD_TOO_LARGE = 413,
	/**
	 * URI provided was too long for the server to process. O
	 * previously called "Request-URI Too Long".
	 */
	URI_TOO_LONG = 414,
	/**
	 * request entity has a media type which the
	 * server or resource does not support.
	 */
	UNSUPPORTED_MEDIA_TYPE = 415,
	/**
	 * client has asked for a portion of the file (byte serving),
	 * but the server cannot supply that portion.
	 */
	RANGE_NOT_SATISFIABLE = 416,
	/**
	 * server cannot meet the requirements of the Expect request-header field.
	 */
	EXPECTATION_FAILED = 417,
	/**
	 * this HTTP status is used as an Easter egg in some websites.
	 */
	I_AM_A_TEAPOT = 418,
	/**
	 * request was directed at a server that is not able to
	 * produce a response (for example because a connection reuse).
	 */
	MISDIRECTED_REQUEST = 421,
	/**
	 * request was well-formed but was unable to
	 * be followed due to semantic errors.
	 */
	UNPROCESSABLE_ENTITY = 422,
	/**
	 * the resource that is being accessed is locked.
	 */
	LOCKED = 423,
	/**
	 * the request failed due to failure of a
	 * previous request (e.g., a PROPPATCH).
	 */
	FAILED_DEPENDENCY = 424,
	/**
	 * the client should switch to a different protocol
	 * such as TLS/1.0, given in the Upgrade header field.
	 */
	UPGRADE_REQUIRED = 426,
	/**
	 * origin server requires the request to be conditional.
	 */
	PRECONDITION_REQUIRED = 428,
	/**
	 * the user has sent too many requests in a given amount
	 * of time.
	 * intended for use with "rate-limiting" schemes.
	 */
	TOO_MANY_REQUESTS = 429,
	/**
	 * server is unwilling to process the request
	 * because either an individual header field,
	 * or all the header fields collectively, are too large.
	 */
	REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
	/**
	 * a server operator has received a legal demand to deny
	 * access to a resource or to a set of resources.
	 */
	UNAVAILABLE_FOR_LEGAL_REASONS = 451,

	/** SECTION: 5xx server error – the server failed to fulfil an apparently valid request */

	/**
	 * a generic error message, given when an unexpected condition
	 * was encountered and no more specific message is suitable.
	 */
	INTERNAL_SERVER_ERROR = 500,
	/**
	 * the server either does not recognize the request method,
	 * or it lacks the ability to fulfill the request.
	 */
	NOT_IMPLEMENTED = 501,
	/**
	 * the server was acting as a gateway or proxy and received an invalid response from the upstream server.
	 */
	BAD_GATEWAY = 502,
	/**
	 * the server is currently unavailable (because it is
	 * overloaded or down for maintenance).
	 */
	SERVICE_UNAVAILABLE = 503,
	/**
	 * the server was acting as a gateway or proxy and did not
	 * receive a timely response from the upstream server.
	 */
	GATEWAY_TIMEOUT = 504,
	/**
	 * the server does not support the HTTP protocol
	 * version used in the request
	 */
	HTTP_VERSION_NOT_SUPPORTED = 505,
	/**
	 * transparent content negotiation for the
	 * request results in a circular reference.
	 */
	VARIANT_ALSO_NEGOTIATES = 506,
	/**
	 * the server is unable to store the representation
	 * needed to complete the request.
	 */
	INSUFFICIENT_STORAGE = 507,
	/**
	 * the server detected an infinite loop while processing the request.
	 */
	LOOP_DETECTED = 508,
	/**
	 * further extensions to the request are
	 * required for the server to fulfill it.
	 */
	NOT_EXTENDED = 510,
	/**
	 * the client needs to authenticate to gain network access.
	 */
	NETWORK_AUTHENTICATION_REQUIRED = 511,
}
