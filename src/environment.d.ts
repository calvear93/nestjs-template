declare global {
    namespace NodeJS {
        interface ProcessEnv {
            ENV: string;
            PORT: number;

            VERSION: string;
            TITLE: string;
            DESCRIPTION: string;

            DEFAULT_DB_CONNECTION: any;
            DEFAULT_DB_HOST: string;
            DEFAULT_DB_PORT: number;

            DEFAULT_DB_USERNAME: string;
            DEFAULT_DB_PASSWORD: string;
            DEFAULT_DB_DATABASE: string;
            DEFAULT_DB_SCHEMA: string;

            DEFAULT_DB_ORM_SYNCHRONIZE: boolean;
            DEFAULT_DB_ORM_LOGGING: boolean;
        }
    }
}

export {};
