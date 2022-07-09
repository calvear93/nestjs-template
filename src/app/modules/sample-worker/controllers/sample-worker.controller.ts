import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FunctionThread } from 'threads';
import { QueuedTask } from 'threads/dist/master/pool';
import { SampleWorkerService } from '../services/sample-worker.service';

/**
 * Sample worker controller.
 *
 * @class SampleWorkerController
 */
@Controller({
    path: 'worker',
    version: '1'
})
@ApiTags('Sample Worker')
export class SampleWorkerController {
    /**
     * Creates an instance of SampleWorkerController.
     *
     * @param {SampleWorkerService} service sample worker service
     */
    constructor(private readonly _service: SampleWorkerService) {}

    /**
     * Executes the fibonacci
     * algorithm in a separate thread.
     *
     * Non thread-blocking operation.
     *
     * @description more than 40 iterations may not finish
     * @param {number} num iterations
     * @returns {Promise<number>} fibonacci result
     */
    @Get('thread')
    thread(@Query('num') num: number): Promise<number> {
        return this._service.thread(num);
    }

    /**
     * Executes the fibonacci
     * algorithm in a thread pool.
     *
     * Non thread-blocking operation
     * and concurrent processing.
     *
     * @description more than 40 iterations may not finish
     * @param {number} num iterations
     * @returns {Promise<number>} fibonacci result
     */
    @Get('threadPool')
    threadPool(@Query('num') num: number): QueuedTask<FunctionThread, number> {
        return this._service.threadPool(num);
    }

    /**
     * Executes the fibonacci
     * algorithm synchronously.
     *
     * Thread-blocking operation.
     *
     * @description more than 40 iterations may not finish
     * @param {number} num iterations
     * @returns {number} fibonacci result
     */
    @Get('normal')
    normal(@Query('num') num: number): number {
        return this._service.normal(num);
    }
}
