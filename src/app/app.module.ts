import { Logger, Module, type OnModuleInit } from '@nestjs/common';
import { SampleModule } from './modules/index.ts';

@Module({
	imports: [SampleModule],
})
export class AppModule implements OnModuleInit {
	onModuleInit() {
		this._logger.debug('Module started');
	}

	private readonly _logger: Logger = new Logger(AppModule.name);
}
