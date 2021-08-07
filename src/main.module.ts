import { Logger, Module } from '@nestjs/common';
import { SampleModule, SampleORMModule } from 'modules';

/**
 * Main module containing every app submodules.
 *
 * @export
 * @class MainModule
 */
@Module({
    imports: [ SampleModule, SampleORMModule ],
    providers: [ Logger ]
})
export class MainModule
{
    constructor(private readonly _logger: Logger) {}

    onModuleInit()
    {
        this._logger.debug(`Application started at port: ${process.env.PORT}`, MainModule.name);
    }
}
