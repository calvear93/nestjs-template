import { tap } from 'rxjs/operators';
import { type Observable } from 'rxjs';
import {
	Injectable,
	type NestInterceptor,
	type ExecutionContext,
	type CallHandler,
	UseInterceptors,
	Logger,
} from '@nestjs/common';

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
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		this._logger.debug('Before...');

		return next.handle().pipe(tap(() => this._logger.debug('After...')));
	}

	private readonly _logger = new Logger(
		___InterceptorName___Interceptor.name,
	);
}

const interceptor = UseInterceptors(new ___InterceptorName___Interceptor());

export const ___InterceptorName___ = () => interceptor;
