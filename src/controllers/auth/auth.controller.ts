import { Controller, Get } from '@nestjs/common';
import { JsonWebToken } from 'common/decorators';

/**
 * Azure JWT validations controller.
 *
 * @export
 * @class AuthController
 */
@Controller('auth')
export class AuthController
{
    /**
     * Validates Azure JWT and returns payload.
     *
     * @param {JsonWebToken} jwtPayload JWT token decoded from global AuthGuard
     *
     * @returns {Promise<any>} JWT payload
     */
    @Get()
    validate(@JsonWebToken() jwtPayload : any) : any
    {
        return jwtPayload;
    }
}
