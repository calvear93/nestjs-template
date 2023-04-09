import { ApiSecurity } from '@nestjs/swagger';
import { applyDecorators, Injectable, UseGuards } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';

const ALLOW_ANONYMOUS = Symbol('allow-anonymous');

/**
 * ApiKey guard.
 *
 * @see https://docs.nestjs.com/guards
 *
 * @example
 * ```ts
 *  // swagger.config.ts
 *  const config = new DocumentBuilder()
 *	  ...
 *	  .addApiKey(
 *		  {
 *			  name: process.env.SECURITY_HEADER_NAME,
 *			  type: 'apiKey',
 *			  description: 'Security Api Key',
 *			  in: 'header'
 *		  },
 *		  'API_KEY_GUARD_NAME'
 *	  )
 *	  .build();
 *
 *  // any.controller.ts
 *	import { ApiKey } from '...';
 *
 *	\@Controller('sample')
 *	\@ApiKey()
 *	export class AnyController { ... }
 * ```
 */
@Injectable()
class ApiKeyGuard implements CanActivate {
	constructor(
		private readonly _headerName: string,
		private readonly _apiKey: string,
	) {}

	/**
	 * Protects api with api-key
	 *
	 * @param context - current request context
	 *
	 * @returns can be executed
	 */
	canActivate(context: ExecutionContext): boolean {
		const req = context.switchToHttp().getRequest();
		const apiKey = req.headers[this._headerName];

		return apiKey === this._apiKey;
	}
}

const isString = (key: PropertyKey): key is string => typeof key === 'string';

/**
 * Ignores method to be protected by ApiKey guard.
 */
export function AllowAnonymous(): MethodDecorator {
	return (target: object, key: PropertyKey) => {
		if (typeof key !== 'number') {
			Reflect.defineMetadata(ALLOW_ANONYMOUS, true, target, key);
		}
	};
}

/**
 * Generates a guard decorator
 * for protects your conrollers
 * with api key.
 */
export const ApiKeyGuardFactory = (
	headerName: string,
	apiKey: string,
	guardName: string,
	enabled = true,
) => {
	return (): ClassDecorator => {
		if (!enabled) return () => void 0;

		return <T extends Function>(target: T) => {
			const properties = Object.getOwnPropertyDescriptors(
				target.prototype,
			);
			const keys = Object.keys(properties).filter<string>(isString);

			// // apply method decorators
			for (const key of keys) {
				const ignore = Reflect.getMetadata(
					ALLOW_ANONYMOUS,
					target.prototype,
					key,
				);
				if (ignore || key === 'constructor') continue;

				const property = properties[key];

				applyDecorators(
					UseGuards(new ApiKeyGuard(headerName, apiKey)),
					ApiSecurity(guardName),
				)(property.value, property.value.name, property);
			}
		};
	};
};
