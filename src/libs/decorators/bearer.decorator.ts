import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extracts token from bearer header.
 *
 * @param {string} [key] bearer header name - should be lowercase
 * @param {ExecutionContext} ctx controller context
 * @returns {string} token
 */
function getBearerToken(key = 'authorization', ctx: ExecutionContext): string {
    const request = ctx.switchToHttp().getRequest();
    const { [key]: bearer } = request.headers;

    return bearer?.split(' ')[1];
}

export const Bearer = createParamDecorator(getBearerToken);
