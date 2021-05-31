import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import defaultDbConfig from 'database/default.database.config';
import { SampleORMController } from './controllers';
import { SampleORMService } from './services';

@Module({
    controllers: [ SampleORMController ],
    providers: [ SampleORMService ],
    imports: [ TypeOrmModule.forRoot(defaultDbConfig) ]
})
export class SampleORMModule {}
