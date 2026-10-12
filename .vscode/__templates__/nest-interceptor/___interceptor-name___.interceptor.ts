import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	Logger,
	type NestInterceptor,
	UseInterceptors,
} from '@nestjs/common';
import { type Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * ___InterceptorName___ interceptor.
 *
 * @see https://docs.nestjs.com/interceptors
 */
@Injectable()
class ___InterceptorName___Interceptor implements NestInterceptor {
	/**
	 * Intercepts a method execution.
	 *
	 * @param context - execution context
	 * @param next - continues to the next handler
	 *
	 * @returns
	 */
	intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Observable<unknown> {
		this._logger.debug('Before...');

		return next.handle().pipe(tap(() => this._logger.debug('After...')));
	}

	private readonly _logger = new Logger(
		___InterceptorName___Interceptor.name,
	);
}

const interceptor = UseInterceptors(new ___InterceptorName___Interceptor());

export const ___InterceptorName___ = () => interceptor;
