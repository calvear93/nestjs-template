import { Controller, Get, Query } from '@nestjs/common';
import { FunctionThread } from 'threads';
import { QueuedTask } from 'threads/dist/master/pool';
import { SampleWorkerService } from '../services/sample-worker.service';

/**
 * Sample worker controller.
 *
 * @export
 * @class SampleWorkerController
 */
@Controller('worker')
export class SampleWorkerController
{
    /**
     * Creates an instance of SampleWorkerController.
     *
     * @param {SampleWorkerService} service sample worker service
     */
    constructor(private service: SampleWorkerService) {}

    /**
     * Executes the fibonacci
     * algorithm in a separate thread.
     *
     * Non thread-blocking operation.
     *
     * @warn more than 40 iterations may not finish
     *
     * @param {number} num iterations
     * @returns {Promise<number>} fibonacci result
     */
    @Get('thread')
    thread(@Query('num') num: number): Promise<number>
    {
        return this.service.thread(num);
    }

    /**
     * Executes the fibonacci
     * algorithm in a thread pool.
     *
     * Non thread-blocking operation
     * and concurrent processing.
     *
     * @warn more than 40 iterations may not finish
     *
     * @param {number} num iterations
     * @returns {Promise<number>} fibonacci result
     */
    @Get('threadPool')
    threadPool(@Query('num') num: number): QueuedTask<FunctionThread, number>
    {
        return this.service.threadPool(num);
    }

    /**
     * Executes the fibonacci
     * algorithm synchronously.
     *
     * Thread-blocking operation.
     *
     * @warn more than 40 iterations may not finish
     *
     * @param {number} num iterations
     * @returns {number} fibonacci result
     */
    @Get('normal')
    normal(@Query('num') num: number): number
    {
        return this.service.normal(num);
    }
}
