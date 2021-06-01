import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import defaultDbConfig from 'database/default.database.config';
import { SampleEntityRepository } from 'database/schema';
import { SampleORMController } from './controllers';
import { SampleORMService } from './services';

/**
 * Sample TypeORM submodule.
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
