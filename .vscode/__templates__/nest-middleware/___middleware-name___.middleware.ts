import { Injectable, Logger, type NestMiddleware } from '@nestjs/common';
import { type FastifyReply, type FastifyRequest } from 'fastify';

/**
 * ___MiddlewareName___ middleware.
 *
 * @see https://docs.nestjs.com/middleware
 */
@Injectable()
export class ___MiddlewareName___Middleware implements NestMiddleware {
	/**
	 * Intercepts requests.
	 *
	 * @param req - inbound request
	 * @param next - continues to the next middleware
	 */
	use(req: FastifyRequest, res: FastifyReply, next: () => void): void {
		this._logger.debug('Middleware triggered');

		next();
	}

	private readonly _logger = new Logger(___MiddlewareName___Middleware.name);
}
