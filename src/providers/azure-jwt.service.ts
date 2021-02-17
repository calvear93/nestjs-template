import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwksClient, { JwksClient } from 'jwks-rsa';

@Injectable()
export default class AzureJwtService
{
    /**
     * Handles Json Web Key Set.
     *
     * @private
     * @type {JwksClient} JWKS client
     */
    private jwksClient : JwksClient;

    constructor(private readonly jwtService : JwtService)
    {
        this.jwksClient = jwksClient({
            jwksUri: process.env.JWT_OPEN_ID_JWKS,
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5
        });
    }

    /**
     * Decodes a JWT token.
     *
     * @param {string} token JWT token string
     *
     * @returns {any} decoded JWT token
     */
    decode(token : string) : any
    {
        return this.jwtService.decode(token, { complete: true }) as any;
    }

    /**
     * Validates a JWT token and return it's payload.
     *
     * @param {string} token JWT token string
     * @returns {Promise<any>} JWT payload
     */
    async validate(token : string) : Promise<any>
    {
        const { header: { kid } } = this.decode(token);

        const publicKey = await this.getPublicKey(kid);

        return await this.jwtService.verifyAsync(token, {
            publicKey,
            ignoreExpiration: process.env.ENV === 'debug',
            clockTolerance: 120,
            issuer: process.env.JWT_AAD_ISSUER
        });
    }

    /**
     * Retrieves public key from
     * Microsoft Active Directory
     * discovery endpoint.
     *
     * @private
     * @param {string} kid JWT kid
     *
     * @returns {string} JWT public key
     */
    private getPublicKey(kid : string) : Promise<string>
    {
        return new Promise<string>((resolve, reject) =>
        {
            this.jwksClient.getSigningKey(kid, (error, key) =>
            {
                if (error)
                    reject(error);

                resolve(key?.getPublicKey());
            });
        });
    }
}
