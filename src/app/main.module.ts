import { Logger, Module, type OnModuleInit } from '@nestjs/common';
import { SampleModule } from '../app/modules/index.js';

@Module({
	imports: [SampleModule],
})
export class MainModule implements OnModuleInit {
	onModuleInit(): void {
		this._logger.debug('Started');
	}

	private readonly _logger: Logger = new Logger(MainModule.name);
}
