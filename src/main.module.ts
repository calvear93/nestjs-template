import { Module } from '@nestjs/common';
import { SampleModule } from 'modules/sample';

@Module({
    imports: [ SampleModule ]
})
export class MainModule {}
