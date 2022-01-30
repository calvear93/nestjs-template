import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

// ORM dirs base path
const BASE_PATH = 'src/database/default';

// typeORM default config
const config: PostgresConnectionOptions = {
    applicationName: process.env.TITLE,

    type: process.env.SQL_DEFAULT_DB_CONNECTION,
    host: process.env.SQL_DEFAULT_DB_HOST,
    port: +process.env.SQL_DEFAULT_DB_PORT,
    username: process.env.SQL_DEFAULT_DB_USERNAME,
    password: process.env.SQL_DEFAULT_DB_PASSWORD,
    database: process.env.SQL_DEFAULT_DB_DATABASE,
    schema: process.env.SQL_DEFAULT_DB_SCHEMA,

    migrationsRun: process.env.SQL_DEFAULT_DB_ORM_RUN_MIGRATIONS === 'true',
    synchronize: process.env.SQL_DEFAULT_DB_ORM_SYNCHRONIZE === 'true',
    logging: process.env.SQL_DEFAULT_DB_ORM_LOGGING === 'true',

    migrationsTableName: '__migrations__',

    migrations: [`${__dirname}/migrations/*{.ts,.js}`],
    entities: [`${__dirname}/**/*.entity{.ts,.js}`],
    subscribers: [`${__dirname}/**/*.subscriber{.ts,.js}`],

    cli: {
        migrationsDir: `${BASE_PATH}/migrations`,
        entitiesDir: `${BASE_PATH}/**/*.entity{.ts,.js}`,
        subscribersDir: `${BASE_PATH}/**/*.subscriber{.ts,.js}`
    }
};

export default config;
