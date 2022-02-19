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
            DATABASE_DEFAULT_NAME: string;
            DATABASE_DEFAULT_CONNECTION: any;
            DATABASE_DEFAULT_HOST: string;
            DATABASE_DEFAULT_PORT: string;

            DATABASE_DEFAULT_USERNAME: string;
            DATABASE_DEFAULT_PASSWORD: string;
            DATABASE_DEFAULT_DATABASE: string;
            DATABASE_DEFAULT_SCHEMA: string;

            DATABASE_DEFAULT_ORM_RUN_MIGRATIONS?: 'false' | 'true';
            DATABASE_DEFAULT_ORM_SYNCHRONIZE?: 'false' | 'true';
            DATABASE_DEFAULT_ORM_LOGGING?: 'false' | 'true';
            DATABASE_DEFAULT_ORM_CACHE?: 'false' | 'true';
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
