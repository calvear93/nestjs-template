import { Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';

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
 *  // api-key.guard.ts
 *	import { SecurityGuardFactory } from '...';
 *	import { ApiKeyGuard } from '...';
 *
 *	export [ApiKey, AllowAnonymous] = SecurityGuardFactory(
 *		ApiKeyGuard,
 *		'API_KEY_GUARD_NAME',
 *		...,
 *	);
 *
 *  // any.controller.ts
 *	import { ApiKey, AllowAnonymous } from '.../api-key.guard';
 *
 *	@Controller('sample')
 *	@ApiKey()
 *	export class AnyController {
 *		secured() { ... }
 *
 *		@AllowAnonymous()
 *		open() { ... }
 *	}
 *	// or
 *	@Controller('sample-two')
 *	export class AnyController {
 *		@ApiKey()
 *		secured() { ... }
 *	}
 * ```
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
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
		const { headers } = context.switchToHttp().getRequest();
		const apiKey = headers[this._headerName];

		return apiKey === this._apiKey;
	}
}
