import { ConnectionOptions } from 'typeorm';

// console.log(__dirname + '/**/*.entity{.ts,.js}');

const config: ConnectionOptions = {
  type: 'postgres',
  host: "localhost",
  port: 5432,
  username: "local",
  password: "123",
  database: "test",
  entities: [
    'src/**/*.ts',
  ],
  cli: {
    migrationsDir: 'migrations',
  }
};

export = config;
