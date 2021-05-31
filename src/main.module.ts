import { Module } from '@nestjs/common';
import { SampleModule } from 'modules/sample';
import { SampleORMModule } from 'modules/sample-orm';

@Module({
    imports: [ SampleModule, SampleORMModule ]
})
export class MainModule {}
