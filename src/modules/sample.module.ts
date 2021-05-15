import { Module } from '@nestjs/common';
import { SampleController } from 'controllers/sample';

@Module({
    controllers: [ SampleController ]
})
export class SampleModule {}
