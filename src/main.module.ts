import { Logger, Module } from '@nestjs/common';
import { SampleModule, SampleWorkerModule, SampleORMModule } from 'modules';

/**
 * Main module containing every app submodules.
 *
 * @export
 * @class MainModule
 */
@Module({
    imports: [
        SampleModule,
        SampleWorkerModule,
        SampleORMModule
    ],
    providers: [ Logger ]
})
export class MainModule
{
    constructor(private readonly logger: Logger) {}

    /**
     * Triggered on module initialization.
     *
     */
    onModuleInit()
    {
        this.logger.debug(`Application started at port: ${process.env.PORT}`, MainModule.name);
    }
}
