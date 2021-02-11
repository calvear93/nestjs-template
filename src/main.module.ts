import { Module } from '@nestjs/common';
import { SampleModule } from 'modules/sample';
import { SampleORMModule } from 'modules/sample-orm';

/**
 * Main module containing every app submodules.
 *
 * @export
 * @class MainModule
 */
@Module({
    imports: [ SampleModule, SampleORMModule ]
})
export class MainModule {}
