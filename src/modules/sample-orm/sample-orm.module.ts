import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { defaultDbConfig, SampleEntityRepository } from 'database/default';
import { SampleORMController } from './controllers/sample-orm.controller';
import { SampleORMService } from './services/sample-orm.service';

/**
 * Sample TypeORM sub-module.
 *
 * @class SampleORMModule
 */
@Module({
    controllers: [SampleORMController],
    providers: [SampleORMService],
    imports: [
        TypeOrmModule.forRoot(defaultDbConfig),
        TypeOrmModule.forFeature([SampleEntityRepository])
    ]
})
export class SampleORMModule {}
