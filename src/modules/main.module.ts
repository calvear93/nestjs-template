import { Module } from '@nestjs/common';
import { SampleModule } from './sample.module';

@Module({
    imports: [ SampleModule ]
})
export class MainModule {}
