import { createSecurityGuard, type SecurityGuard } from '#libs/decorators';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { type DocumentBuilder } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';

// derived from the public API — @nestjs/swagger's exports map blocks deep
// imports of dist/interfaces/open-api-spec.interface
type SecuritySchemeObject = NonNullable<
	Parameters<DocumentBuilder['addApiKey']>[0]
>;

/**
 * ApiKey guard.
 *
 * Protects routes with a static api key carried in a header. The
 * `@ApiKey()` / `@AllowAnonymous()` pair is a no-op while SECURITY_ENABLED
 * is not 'true', so a fresh template runs unprotected.
 *
 * Environment:
 * - SECURITY_ENABLED - 'true' turns the guard on
 * - SECURITY_HEADER_NAME - header carrying the key (i.e. 'x-api-key')
 * - SECURITY_API_KEY - expected value, required once enabled
 *
 * @see https://docs.nestjs.com/guards
 *
 * @example
 * ```ts
 *	// app.ts, under the guard class name
 *	const config = new DocumentBuilder()
 *		.addApiKey(SECURITY_API_SCHEMA, ApiKeyGuard.name)
 *		.build();
 *
 *	// api-key.guard.ts, header and key injected into canActivate
 *	export const [ApiKey, AllowAnonymous] = createSecurityGuard(
 *		ApiKeyGuard,
 *		ENABLED,
 *		HEADER_NAME,
 *		API_KEY,
 *	);
 *
 *	// any.controller.ts
 *	import { ApiKey, AllowAnonymous } from '.../api-key.guard.ts';
 *
 *	@Controller('sample')
 *	@ApiKey()
 *	export class AnyController {
 *		// answers 401 without a valid 'x-api-key' header
 *		secured() { ... }
 *
 *		@AllowAnonymous()
 *		open() { ... }
 *	}
 *	// or per method, leaving the rest of the controller open
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
	 * Protects api with api-key.
	 *
	 * @param context - current request context
	 * @param headerName - header carrying the key, injected by the decorator
	 * @param apiKey - expected api key value, injected by the decorator
	 *
	 * @throws UnauthorizedException 401 when the api key is missing or does
	 * 	not match; 403 is left for authorization decisions
	 *
	 * @returns can be executed
	 */
	canActivate(
		context: ExecutionContext,
		headerName: string,
		apiKey: string,
	): boolean {
		const { headers } = context.switchToHttp().getRequest<FastifyRequest>();
		const received = headers[headerName];

		// 401 is "I do not know who you are", 403 is left for authorization
		if (!received) throw new UnauthorizedException('Api key is missing');

		if (received !== apiKey)
			throw new UnauthorizedException('Api key is not valid');

		return true;
	}
}

// fastify lowercases every incoming header name, so the configured one must
// be normalized or the lookup silently misses
const HEADER_NAME = process.env.SECURITY_HEADER_NAME?.trim().toLowerCase();
const API_KEY = process.env.SECURITY_API_KEY;
const ENABLED = process.env.SECURITY_ENABLED === 'true';

// an enabled guard without its values would leave the api silently open
if (ENABLED && (!HEADER_NAME || !API_KEY))
	throw new Error(
		'SECURITY_HEADER_NAME and SECURITY_API_KEY are required when SECURITY_ENABLED is true',
	);

/**
 * Swagger security scheme, registered under the guard class name.
 */
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
