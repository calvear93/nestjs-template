import { type Request } from 'express';
import { type SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface.js';
import { ApiSecurity } from '@nestjs/swagger';
import {
	applyDecorators,
	type CanActivate,
	type ExecutionContext,
	Injectable,
	UseGuards,
} from '@nestjs/common';

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
 *	import { ApiKeyAuth } from '...';
 *
 *	\@Controller('sample')
 *	\@ApiKeyAuth('ms-api-key', 'secret-api-key', 'API_KEY_GUARD_NAME')
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
		const req: Request = context.switchToHttp().getRequest();
		const apiKey = req.headers[this._headerName];

		return apiKey === this._apiKey;
	}
}

/**
 * Creates a ApiKey auth guard and Swagger security schema.
 *
 * @param headerName - name of auth header
 * @param apiKey - the key
 * @param guardName - auth name for swagger
 *
 * @returns class decorator and Swagger security schema
 */
export function ApiKeyFactory(
	headerName: string,
	apiKey: string,
	guardName: string,
): [ClassDecorator, SecuritySchemeObject] {
	return [
		applyDecorators(
			UseGuards(new ApiKeyGuard(headerName, apiKey)),
			ApiSecurity(guardName),
		),
		{
			name: headerName,
			type: 'apiKey',
			description: 'Security Api Key',
			in: 'header',
		},
	];
}
