declare global {
    namespace NodeJS {
        // NOTE: only string type is supported
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production' | 'test';
            ENV: 'dev' | 'release';
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
            SWAGGER_UI: 'false' | 'true';
        }
    }

    // SECTION: global custom types

    type decimal = number;

    type seconds = number;

    type millis = number;

    // Unix timestamp, number of seconds that have elapsed since January 1, 1970
    type epoch = seconds;

    type AnyError = unknown;

    // https://en.wikipedia.org/wiki/ISO_8601#Durations
    type DurationISO8601 = string;
}

export {};
