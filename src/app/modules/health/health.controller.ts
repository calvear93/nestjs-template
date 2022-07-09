import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheckResult } from './models/health-check-result';

/**
 * Health check controller using Terminus.
 *
 * @class HealthController
 */
@Controller({
    path: 'health',
    version: VERSION_NEUTRAL
})
@ApiTags('Health Check')
export class HealthController {
    /**
     * Returns health check status set.
     *
     * @returns {HealthCheckResult} health status
     */
    @Get()
    check(): Promise<HealthCheckResult> {
        return Promise.resolve({ status: 'ok' });
    }
}
