import { Module } from '@nestjs/common';
import { SampleController } from './controllers';
import { SampleService } from './services';

/**
 * Sample module.
 *
 * @export
 * @class SampleModule
 */
@Module({
    controllers: [ SampleController ],
    providers: [ SampleService ]
})
export class SampleModule
{
    /**
     * Triggered on module initialization.
     *
     */
    onModuleInit()
    {
        // eslint-disable-next-line no-console
        console.log('SampleModule initialized.');
    }
}
