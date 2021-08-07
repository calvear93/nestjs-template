import { Controller, Get } from '@nestjs/common';
import { SampleService } from '../services/sample.service';

/**
 * Sample controller.
 *
 * @export
 * @class SampleController
 */
@Controller('sample')
export class SampleController
{
    /**
     * Creates an instance of SampleController.
     *
     * @param {SampleService} service sample service
     */
    constructor(private service: SampleService) {}

    /**
     * Return sample result.
     *
     * @returns {string} sample string
     */
    @Get()
    sample(): string
    {
        return this.service.sample();
    }
}
