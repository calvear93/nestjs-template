import { Module } from '@nestjs/common';
import { SampleORMController } from './controllers';
import { SampleORMService } from './services';

@Module({
    controllers: [ SampleORMController ],
    providers: [ SampleORMService ]
})
export class SampleORMModule {}
