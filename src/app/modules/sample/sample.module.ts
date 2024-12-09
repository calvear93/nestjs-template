import { Module } from '@nestjs/common';
import { SampleController } from './controllers/sample.controller.ts';
import { SampleService } from './services/sample.service.ts';

@Module({
	providers: [SampleService],
	controllers: [SampleController],
})
export class SampleModule {}
