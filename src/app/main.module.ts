import { Logger, Module, type OnModuleInit } from '@nestjs/common';
import { SampleModule } from '../app/modules/index.js';

@Module({
	imports: [SampleModule],
})
export class MainModule implements OnModuleInit {
	onModuleInit() {
		this._logger.debug(
			`\x1B[4mApi Key\x1B[0m enabled: ${
				process.env.SECURITY_ENABLED === 'true'
					? '\x1B[32mON'
					: '\x1B[31mOFF'
			}`,
		);
	}

	private readonly _logger: Logger = new Logger(MainModule.name);
}
