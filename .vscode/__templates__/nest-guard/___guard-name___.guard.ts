import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	Logger,
	UseGuards,
} from '@nestjs/common';
import { type Observable } from 'rxjs';

/**
 * ___GuardName___ guard.
 *
 * @see https://docs.nestjs.com/guards
 */
@Injectable()
class ___GuardName___Guard implements CanActivate {
	/**
	 * Validates if request may continue
	 *
	 * @param context - current request context
	 *
	 * @returns whether can be executed
	 */
	canActivate(
		_context: ExecutionContext,
	): Observable<boolean> | Promise<boolean> | boolean {
		this._logger.debug('Guard triggered');

		return true;
	}

	private readonly _logger = new Logger(___GuardName___Guard.name);
}

const guard = UseGuards(new ___GuardName___Guard());

export const ___GuardName___ = () => guard;
