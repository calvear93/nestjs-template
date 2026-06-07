import { Logger, Module, type OnModuleInit } from '@nestjs/common';

/**
 * ___ModuleName___ module.
 * NOTE: import it in your 'main.module' at 'imports' array.
 *
 * @see https://docs.nestjs.com/modules
 */
@Module({
	imports: [],
	controllers: [],
	providers: [],
})
export class ___ModuleName___Module implements OnModuleInit {
	onModuleInit(): void {
		this._logger.debug('Module started');
	}

	private readonly _logger = new Logger(___ModuleName___Module.name);
}
