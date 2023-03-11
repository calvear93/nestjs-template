import { Logger, Module } from '@nestjs/common';
import { HealthModule, SampleModule } from '../app/modules/index.js';

@Module({
	imports: [HealthModule, SampleModule],
})
export class MainModule {
	onModuleInit(): void {
		this._logger.debug('Started');
	}

	private readonly _logger: Logger = new Logger(MainModule.name);
}
