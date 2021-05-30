import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SampleModule } from 'modules/sample';

@Module({
    imports: [ SampleModule, TypeOrmModule.forRoot({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'local',
        password: '123',
        database: 'test',
        entities: [ __dirname + '/**/*.entity{.ts,.js}' ],
        migrations: [ 'database/migrations' ],
        // synchronize: true
    }) ]
})
export class MainModule {}
