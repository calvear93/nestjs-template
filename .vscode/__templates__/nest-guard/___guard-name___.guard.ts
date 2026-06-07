import { type Observable } from 'rxjs';
import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	UseGuards,
} from '@nestjs/common';

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
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		console.log(`Guard ${___GuardName___Guard.name} triggered!`);

		return true;
	}
}

const guard = UseGuards(new ___GuardName___Guard());

export const ___GuardName___ = () => guard;
