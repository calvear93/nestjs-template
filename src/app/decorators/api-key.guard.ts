import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { type SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface.ts';
import { createSecurityGuard } from '#libs/decorators';

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
 *		  ApiKeyGuard.name
 *	  )
 *	  .build();
 *
 *  // api-key.guard.ts
 *	import { SecurityGuardFactory } from '...';
 *	import { ApiKeyGuard } from '...';
 *
 *	export [ApiKey, AllowAnonymous] = SecurityGuardFactory(
 *		ApiKeyGuard,
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

	constructor(
		private readonly _headerName: string,
		private readonly _apiKey: string,
	) {}
}

const HEADER_NAME = process.env.SECURITY_HEADER_NAME;
const API_KEY = process.env.SECURITY_API_KEY;
const ENABLED = process.env.SECURITY_ENABLED === 'true' && !!API_KEY;

export const SECURITY_API_SCHEMA: SecuritySchemeObject = {
	description: 'Security Api Key',
	in: 'header',
	name: HEADER_NAME,
	type: 'apiKey',
};

export const [ApiKey, AllowAnonymous] = createSecurityGuard(
	ApiKeyGuard,
	ENABLED,
	HEADER_NAME,
	API_KEY,
);
