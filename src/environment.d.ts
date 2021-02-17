declare global {
    namespace NodeJS {
        interface ProcessEnv {
            ENV : string;
            PORT : number;

            VERSION : string;
            TITLE : string;
            DESCRIPTION : string;

            JWT_AAD_TENANT_ID : string;
            JWT_AAD_CLIENT_ID : string;
            JWT_AAD_ISSUER : string;
            JWT_OPEN_ID_JWKS : string;
        }
    }
}

export {};
