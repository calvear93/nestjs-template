import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { type HealthCheckResult } from './models/health-check-result.js';

@Controller({
	path: 'health',
	version: VERSION_NEUTRAL,
})
@ApiTags('Health Check')
export class HealthController {
	/**
	 * Returns health check status set.
	 *
	 * @returns health status
	 */
	@Get()
	check(): Promise<HealthCheckResult> {
		return Promise.resolve({ status: 'ok' });
	}
}
