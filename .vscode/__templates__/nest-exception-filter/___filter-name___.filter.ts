import { HttpAdapterHost } from '@nestjs/core';
import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common';

/**
 * ___FilterName___ exception filter.
 * NOTE: import it in your context module at 'providers' array
 *  or with decorator @UseFilters(new ___FilterName___ExceptionFilter())
 *
 * Remove @Catch() decorator for scoped catching.
 *
 * @see https://docs.nestjs.com/exception-filters
 */
@Catch()
export class ___FilterName___ExceptionFilter implements ExceptionFilter {
	/**
	 * Captures all exceptions.
	 *
	 * @param exception - thrown exception
	 * @param host - execution context
	 */
	catch(exception: unknown, host: ArgumentsHost) {
		// in certain situations `httpAdapter` might not be available in the
		// constructor method, thus we should resolve it here.
		const { httpAdapter } = this.httpAdapterHost;

		const ctx = host.switchToHttp();

		const httpStatus =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		const responseBody = {
			path: httpAdapter.getRequestUrl(ctx.getRequest()),
			statusCode: httpStatus,
			timestamp: new Date().toISOString(),
		};

		httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
	}

	constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

	private readonly _logger = new Logger(___FilterName___ExceptionFilter.name);
}
