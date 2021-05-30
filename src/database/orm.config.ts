import { ConnectionOptions } from 'typeorm';

const config: ConnectionOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'local',
    password: '123',
    database: 'test',
    entities: [ 'src/**/*.entity{.ts,.js}' ],
    cli: {
        migrationsDir: 'src/database/migrations'
    }
};

export default config;
