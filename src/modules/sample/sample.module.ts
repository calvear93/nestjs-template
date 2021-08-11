import { Module } from '@nestjs/common';
import { SampleController } from './controllers/sample.controller';
import { SampleService } from './services/sample.service';

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
export class SampleModule {}
