import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

// ORM dirs base path
const BASE_PATH = 'src/database/default';

// typeORM default config
const config: PostgresConnectionOptions = {
    applicationName: process.env.NAME,
    name: process.env.DATABASE_DEFAULT_NAME,

    type: process.env.DATABASE_DEFAULT_CONNECTION,
    host: process.env.DATABASE_DEFAULT_HOST,
    port: +process.env.DATABASE_DEFAULT_PORT,
    username: process.env.DATABASE_DEFAULT_USERNAME,
    password: process.env.DATABASE_DEFAULT_PASSWORD,
    database: process.env.DATABASE_DEFAULT_DATABASE,
    schema: process.env.DATABASE_DEFAULT_SCHEMA,

    migrationsRun: process.env.DATABASE_DEFAULT_ORM_RUN_MIGRATIONS === 'true',
    synchronize: process.env.DATABASE_DEFAULT_ORM_SYNCHRONIZE === 'true',
    logging: process.env.DATABASE_DEFAULT_ORM_LOGGING === 'true',
    cache: process.env.DATABASE_DEFAULT_ORM_CACHE === 'true',

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
