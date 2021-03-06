import { ConnectionOptions } from 'typeorm';

// ORM dirs base path
const BASE_PATH = 'src/database';

// typeORM default config
const config: ConnectionOptions = {
    type: process.env.DEFAULT_DB_CONNECTION,
    host: process.env.DEFAULT_DB_HOST,
    port: process.env.DEFAULT_DB_PORT,
    username: process.env.DEFAULT_DB_USERNAME,
    password: process.env.DEFAULT_DB_PASSWORD,
    database: process.env.DEFAULT_DB_DATABASE,
    schema: process.env.DEFAULT_DB_SCHEMA,

    migrationsRun: process.env.DEFAULT_DB_ORM_RUN_MIGRATIONS === 'true',
    synchronize: process.env.DEFAULT_DB_ORM_SYNCHRONIZE === 'true',
    logging: process.env.DEFAULT_DB_ORM_LOGGING === 'true',

    migrations: [ `${__dirname}/migrations/*{.ts,.js}` ],
    entities: [ `${__dirname}/**/*.entity{.ts,.js}` ],
    subscribers: [ `${__dirname}/**/*.subscriber{.ts,.js}` ],

    cli: {
        migrationsDir: `${BASE_PATH}/migrations`,
        entitiesDir: `${BASE_PATH}/**/*.entity{.ts,.js}`,
        subscribersDir: `${BASE_PATH}/**/*.subscriber{.ts,.js}`
    }
};

export default config;
