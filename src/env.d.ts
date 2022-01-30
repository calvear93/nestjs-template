declare global {
    namespace NodeJS {
        // NOTE: only string type is supported
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production' | 'test';
            ENV: 'dev' | 'qa' | 'prod';
            DEBUG?: string;

            // SECTION: runtime environment
            HOSTNAME: string;

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

    // SECTION: global custom types

    type decimal = number;

    type seconds = number;

    type millis = number;

    // Unix timestamp, number of seconds that have elapsed since January 1, 1970
    type epoch = seconds;

    // https://en.wikipedia.org/wiki/ISO_8601#Durations
    type DurationISO8601 = string;
}

export {};
