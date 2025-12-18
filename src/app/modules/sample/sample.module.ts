import { Module } from '@nestjs/common';
import { SampleController } from './controllers/sample.controller.ts';
import { SampleService } from './services/sample.service.ts';

@Module({
	controllers: [SampleController],
	providers: [SampleService],
})
export class SampleModule {}
