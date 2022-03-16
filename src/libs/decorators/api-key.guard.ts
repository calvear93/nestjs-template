import {
    applyDecorators,
    CanActivate,
    ExecutionContext,
    Injectable,
    UseGuards
} from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { Request } from 'express';

const SECURITY_ENABLED = process.env.SECURITY_ENABLED === 'true';

/**
 * ApiKey guard.
 *
 * @see https://docs.nestjs.com/guards
 *
 * @example
 *  // swagger.config.ts
 *  const config = new DocumentBuilder()
 *      ...
 *      .addApiKey(
 *          {
 *              name: process.env.SECURITY_HEADER_NAME,
 *              type: 'apiKey',
 *              description: 'Security Api Key',
 *              in: 'header'
 *          },
 *          'API_KEY_GUARD_NAME'
 *      )
 *      .build();
 *
 *  // any.controller.ts
 *  import { ApiKeyAuth } from '...';
 *
 *  @Controller('sample')
 *  @ApiKeyAuth('ms-api-key', 'secret-api-key', 'API_KEY_GUARD_NAME')
 *  export class AnyController { ... }
 * @class ApiKeyGuard
 */
@Injectable()
class ApiKeyGuard implements CanActivate {
    constructor(
        private readonly _headerName: string,
        private readonly _apiKey: string
    ) {}

    /**
     * Protects api with api-key
     *
     * @param {ExecutionContext} context current request context
     *
     * @returns {boolean} can be executed
     */
    canActivate(context: ExecutionContext): boolean {
        const req: Request = context.switchToHttp().getRequest();
        const apiKey = req.headers[this._headerName];

        return apiKey === this._apiKey;
    }
}

/**
 * Applies ApiKey auth guard.
 *
 * @export
 * @param {string} headerName name of auth header
 * @param {string} apiKey the key
 * @param {string} guardName auth name for swagger
 *
 * @returns {ClassDecorator} class decorator
 */
export function ApiKeyAuth(
    headerName: string,
    apiKey: string,
    guardName: string
): ClassDecorator {
    return SECURITY_ENABLED
        ? applyDecorators(
              UseGuards(new ApiKeyGuard(headerName, apiKey)),
              ApiSecurity(guardName)
          )
        : () => undefined;
}
