declare global {
    namespace NodeJS {
        // ! booleans are not supported and number must be casted using + operator
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production';
            ENV: 'dev' | 'qa' | 'prod';

            // SECTION: project info from package.json
            VERSION: string;
            TITLE: string;
            DESCRIPTION: string;

            // SECTION: base config
            PORT: number;
            API_PREFIX: string;
            TIME_ZONE: string;

            // SECTION: default database config
            DEFAULT_DB_CONNECTION: any;
            DEFAULT_DB_HOST: string;
            DEFAULT_DB_PORT: number;

            DEFAULT_DB_USERNAME: string;
            DEFAULT_DB_PASSWORD: string;
            DEFAULT_DB_DATABASE: string;
            DEFAULT_DB_SCHEMA: string;

            DEFAULT_DB_ORM_RUN_MIGRATIONS?: 'false' | 'true';
            DEFAULT_DB_ORM_SYNCHRONIZE?: 'false' | 'true';
            DEFAULT_DB_ORM_LOGGING?: 'false' | 'true';
        }
    }
}

export {};
