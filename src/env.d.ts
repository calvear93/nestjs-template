declare global {
    namespace NodeJS {
        // NOTE: only string type is supported
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production' | 'test';
            ENV: 'dev' | 'qa' | 'prod';
            DEBUG?: string;

            // SECTION: project info from package.json
            VERSION: string;
            NAME: string;
            TITLE: string;
            DESCRIPTION: string;

            // SECTION: base config
            PORT: string;
            API_PREFIX: string;
            TIME_ZONE: string;

            // SECTION: default database config
            SQL_DEFAULT_DB_CONNECTION: any;
            SQL_DEFAULT_DB_HOST: string;
            SQL_DEFAULT_DB_PORT: string;

            SQL_DEFAULT_DB_USERNAME: string;
            SQL_DEFAULT_DB_PASSWORD: string;
            SQL_DEFAULT_DB_DATABASE: string;
            SQL_DEFAULT_DB_SCHEMA: string;

            SQL_DEFAULT_DB_ORM_RUN_MIGRATIONS?: 'false' | 'true';
            SQL_DEFAULT_DB_ORM_SYNCHRONIZE?: 'false' | 'true';
            SQL_DEFAULT_DB_ORM_LOGGING?: 'false' | 'true';
        }
    }

    // SECTION: custom global types
    type UUID = `${string}-${string}-${string}-${string}-${string}`;

    type numberString = `${number}`;
}

export {};
