import {
	type DynamicModule,
	Logger,
	Module,
	type OnModuleInit,
} from '@nestjs/common';

/**
 * ___ModuleName___ dynamic module.
 * NOTE: import it in your 'main.module' at 'imports' array.
 *
 * @see https://docs.nestjs.com/fundamentals/dynamic-modules
 */
@Module({})
export class ___ModuleName___Module implements OnModuleInit {
	onModuleInit(): void {
		this._logger.debug('Module started');
	}

	private readonly _logger = new Logger(___ModuleName___Module.name);

	/**
	 * Register the module with configuration.
	 *
	 * @returns module registration
	 */
	static register(): DynamicModule {
		return {
			module: ___ModuleName___Module,
			controllers: [],
			imports: [],
			exports: [],
			providers: [],
		};
	}
}
