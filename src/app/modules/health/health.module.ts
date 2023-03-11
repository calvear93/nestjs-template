import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';

@Module({
	imports: [],
	controllers: [HealthController],
})
export class HealthModule {}
