import { Logger, Module } from '@nestjs/common';
import {
    HealthModule,
    SampleModule,
    SampleORMModule,
    SampleWorkerModule
} from 'modules';

/**
 * Main module containing every app submodules.
 *
 * @class MainModule
 */
@Module({
    imports: [HealthModule, SampleModule, SampleWorkerModule, SampleORMModule]
})
export class MainModule {
    private readonly logger: Logger = new Logger(MainModule.name);

    /**
     * Triggered on module initialization.
     */
    onModuleInit(): void {
        this.logger.debug(`Application started at port: ${process.env.PORT}`);
    }
}
