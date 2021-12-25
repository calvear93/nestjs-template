import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckResult,
    HealthCheckService
} from '@nestjs/terminus';

/**
 * Health check controller using Terminus.
 *
 * @class HealthController
 */
@Controller({
    path: 'health',
    version: VERSION_NEUTRAL
})
export class HealthController {
    /**
     * Creates an instance of HealthController.
     *
     * @param {HealthCheckService} health terminus health transformer
     */
    constructor(private readonly health: HealthCheckService) {}

    /**
     * Returns health check status set.
     *
     * @returns {HealthCheckResult} health status
     */
    @Get()
    @HealthCheck()
    check(): Promise<HealthCheckResult> {
        return this.health.check([]);
    }
}
