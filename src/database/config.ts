import { ConnectionOptions } from 'typeorm';

const config: ConnectionOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'local',
    password: '123',
    database: 'test',
    entities: [ '**/*.entity{.ts,.js}' ],
    cli: {
        migrationsDir: 'migrations'
    }
};

export = config;
