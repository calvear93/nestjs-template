import { type FastifyRequest, type FastifyReply } from 'fastify';
import { Injectable, type NestMiddleware, Logger } from '@nestjs/common';

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
