import type { ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { type SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface.ts';
import { createSecurityGuard, type SecurityGuard } from '#libs/decorators';
import { FastifyRequest } from 'fastify';

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
 *	import { createSecurityGuard } from '...';
 *	import { ApiKeyGuard } from '...';
 *
 *	export [ApiKey, AllowAnonymous] = createSecurityGuard(
 *		ApiKeyGuard,
 *		...,
 *	);
 *
 *  // any.controller.ts
 *	import { ApiKey, AllowAnonymous } from '.../api-key.guard.ts';
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
export class ApiKeyGuard implements SecurityGuard {
	/**
	 * Protects api with api-key
	 *
	 * @param context - current request context
	 *
	 * @returns can be executed
	 */
	canActivate(
		context: ExecutionContext,
		headerName: string,
		apiKey: string,
	): boolean {
		const { headers } = context.switchToHttp().getRequest<FastifyRequest>();

		return headers[headerName] === apiKey;
	}
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
