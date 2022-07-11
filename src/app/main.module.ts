import { Logger, Module } from '@nestjs/common';
import { HealthModule, SampleModule } from 'app/modules';

/**
 * Main module containing every app submodules.
 *
 * @class MainModule
 */
@Module({
    imports: [HealthModule, SampleModule]
})
export class MainModule {
    private readonly _logger: Logger = new Logger(MainModule.name);

    /**
     * Triggered on module initialization.
     */
    onModuleInit(): void {
        this._logger.debug(`Application started at port: ${process.env.PORT}`);
    }
}
