import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { getBearerToken } from 'common/decorators/bearer.decorator';
import { AzureJwtService } from 'providers';

@Injectable()
export default class AuthGuard implements CanActivate
{
    public constructor(private readonly azureJwt : AzureJwtService) {}

    /**
     * Validates context execution.
     *
     * @param {ExecutionContext} ctx controller context
     *
     * @returns {Promise<boolean>} true if context can continue, false in otherwise.
     */
    async canActivate(ctx : ExecutionContext) : Promise<boolean>
    {
        const token = getBearerToken('authorization', ctx);

        try
        {
            const payload = await this.azureJwt.validate(token);
            this.setContextPayload(ctx, payload);

            return true;
        }
        catch
        {
            return false;
        }
    }

    /**
     * Sets the context JWT payload.
     *
     * @private
     * @param {ExecutionContext} ctx controller context
     * @param {any} payload JWT payload
     */
    private setContextPayload(ctx : ExecutionContext, payload : any) : void
    {
        const request = ctx.switchToHttp().getRequest();

        request.payload = payload;
    }
}
