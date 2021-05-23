import { Module } from '@nestjs/common';
import { SampleController } from './controllers';
import { SampleService } from './services';

@Module({
    controllers: [ SampleController ],
    providers: [ SampleService ]
})
export class SampleModule
{
    onModuleInit()
    {
        // eslint-disable-next-line no-console
        console.log('SampleModule initialized.');
    }
}
