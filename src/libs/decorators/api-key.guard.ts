import { ApiSecurity } from '@nestjs/swagger';
import { applyDecorators, Injectable, UseGuards } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';

const ALLOW_ANONYMOUS = Symbol('allow-anonymous');

const isString = (key: PropertyKey): key is string => typeof key === 'string';

const isFn = (value: Function | object): value is Function =>
	value instanceof Function;

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
 *	import { ApiKey, AllowAnonymous } from '...';
 *
 *	\@Controller('sample')
 *	\@ApiKey()
 *	export class AnyController {
 *		\secured() { ... }
 *
 *		@AllowAnonymous()
 *		\open() { ... }
 *	}
 *	// or
 *	\@Controller('sample-two')
 *	export class AnyController {
 *		\@ApiKey()
 *		secured() { ... }
 *	}
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

/**
 * Ignores method to be protected by ApiKey guard.
 */
export function AllowAnonymous(): MethodDecorator {
	return (target: object, key: PropertyKey) => {
		if (isString(key)) {
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
	// eslint-disable-next-line unicorn/consistent-function-scoping
	if (!enabled) return () => () => void 0;

	const apply = (descriptor: PropertyDescriptor) =>
		applyDecorators(
			UseGuards(new ApiKeyGuard(headerName, apiKey)),
			ApiSecurity(guardName),
		)(descriptor.value, descriptor.value.name, descriptor);

	return (): ClassDecorator & MethodDecorator => {
		return <T extends Function>(
			target: T | object,
			_?: PropertyKey,
			descriptor?: PropertyDescriptor,
		) => {
			// method decoration
			if (!isFn(target)) {
				return descriptor && apply(descriptor);
			}

			// class decoration
			const descriptors = Object.getOwnPropertyDescriptors(
				target.prototype,
			);

			const keys = Object.keys(descriptors).filter<string>(isString);

			// apply to class methods
			for (const key of keys) {
				const ignore = Reflect.getMetadata(
					ALLOW_ANONYMOUS,
					target.prototype,
					key,
				);

				if (ignore || key === 'constructor') continue;

				apply(descriptors[key]);
			}
		};
	};
};
