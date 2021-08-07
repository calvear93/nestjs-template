import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { defaultDbConfig, SampleEntityRepository } from 'database/default';
import { SampleORMController } from './controllers';
import { SampleORMService } from './services';

/**
 * Sample TypeORM sub-module.
 *
 * @export
 * @class SampleORMModule
 */
@Module({
    controllers: [ SampleORMController ],
    providers: [ SampleORMService ],
    imports: [
        TypeOrmModule.forRoot(defaultDbConfig),
        TypeOrmModule.forFeature([ SampleEntityRepository ])
    ]
})
export class SampleORMModule {}
