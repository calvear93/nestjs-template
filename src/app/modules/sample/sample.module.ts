import { Module } from '@nestjs/common';
import { SampleService } from './services/sample.service.ts';
import { SampleController } from './controllers/sample.controller.ts';

@Module({
	controllers: [SampleController],
	providers: [SampleService],
})
export class SampleModule {}
