import { Module } from '@nestjs/common';
import { SampleService } from './services/sample.service.js';
import { SampleController } from './controllers/sample.controller.js';

@Module({
	controllers: [SampleController],
	providers: [SampleService],
})
export class SampleModule {}
