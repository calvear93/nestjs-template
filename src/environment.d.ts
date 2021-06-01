declare global {
    namespace NodeJS {
        // ! booleans are not supported and number may converted with + operator
        interface ProcessEnv {
            ENV: string;
            PORT: number;

            VERSION: string;
            TITLE: string;
            DESCRIPTION: string;

            GLOBAL_API_PREFIX: string;

            DEFAULT_DB_CONNECTION: any;
            DEFAULT_DB_HOST: string;
            DEFAULT_DB_PORT: number;

            DEFAULT_DB_USERNAME: string;
            DEFAULT_DB_PASSWORD: string;
            DEFAULT_DB_DATABASE: string;
            DEFAULT_DB_SCHEMA: string;

            DEFAULT_DB_ORM_RUN_MIGRATIONS: string;
            DEFAULT_DB_ORM_SYNCHRONIZE: string;
            DEFAULT_DB_ORM_LOGGING: string;
        }
    }
}

export {};
