import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SampleService } from '../services/sample.service';

/**
 * Sample controller.
 *
 * @class SampleController
 */
@Controller({
    path: 'basic',
    version: '1'
})
@ApiTags('Sample')
export class SampleController {
    /**
     * Creates an instance of SampleController.
     *
     * @param {SampleService} service sample service
     */
    constructor(private readonly _service: SampleService) {}

    /**
     * Return sample result.
     *
     * @returns {string} sample string
     */
    @Get()
    run(): string {
        return this._service.sample();
    }
}
