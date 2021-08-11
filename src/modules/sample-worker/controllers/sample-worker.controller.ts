import { Controller, Get, Query } from '@nestjs/common';
import { SampleWorkerService } from '../services/sample-worker.service';

/**
 * Sample worker controller.
 *
 * @export
 * @class SampleWorkerController
 */
@Controller('sample/worker')
export class SampleWorkerController
{
    /**
     * Creates an instance of SampleWorkerController.
     *
     * @param {SampleWorkerService} service sample worker service
     */
    constructor(private service: SampleWorkerService) {}

    @Get('thread')
    thread(@Query('num') num: number): Promise<number>
    {
        return this.service.thread(num);
    }

    @Get('normal')
    normal(@Query('num') num: number): number
    {
        return this.service.normal(num);
    }
}
