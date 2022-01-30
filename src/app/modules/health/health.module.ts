import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

/**
 * Health check module.
 *
 * @see https://docs.nestjs.com/recipes/terminus
 * @class HealthModule
 */
@Module({
    imports: [TerminusModule],
    controllers: [HealthController]
})
export class HealthModule {}
