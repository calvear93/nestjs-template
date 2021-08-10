declare global {
    namespace NodeJS {
        // NOTE: only string type is supported
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production';
            ENV: 'dev' | 'qa' | 'prod';

            // SECTION: project info from package.json
            VERSION: string;
            TITLE: string;
            DESCRIPTION: string;

            // SECTION: base config
            PORT: string;
            API_PREFIX: string;
            TIME_ZONE: string;

            // SECTION: default database config
            DEFAULT_DB_CONNECTION: any;
            DEFAULT_DB_HOST: string;
            DEFAULT_DB_PORT: string;

            DEFAULT_DB_USERNAME: string;
            DEFAULT_DB_PASSWORD: string;
            DEFAULT_DB_DATABASE: string;
            DEFAULT_DB_SCHEMA: string;

            DEFAULT_DB_ORM_RUN_MIGRATIONS?: 'false' | 'true';
            DEFAULT_DB_ORM_SYNCHRONIZE?: 'false' | 'true';
            DEFAULT_DB_ORM_LOGGING?: 'false' | 'true';
        }
    }

    // SECTION: custom global types
    type UUID = `${string}-${string}-${string}-${string}-${string}`;

    type numberString = `${number}`;
}

export {};
