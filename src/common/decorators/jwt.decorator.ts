import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Retrieves JWT payload after
 * AuthGuard apply.
 *
 * @export
 * @param {any} data context data
 * @param {ExecutionContext} ctx controller context
 *
 * @returns {any} JWT payload
 */
function getDecodedJWT(data : any, ctx : ExecutionContext) : any
{
    return ctx.switchToHttp().getRequest()?.payload;
}

export default createParamDecorator(getDecodedJWT);
