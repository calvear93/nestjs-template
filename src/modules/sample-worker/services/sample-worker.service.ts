import { Inject, Injectable } from '@nestjs/common';
import { FunctionThread } from 'threads';
import { fibonacci } from './fibonacci';

/**
 * Sample worker service.
 *
 * @export
 * @class SampleWorkerService
 */
@Injectable()
export class SampleWorkerService
{
    constructor(
        @Inject('FIBONACCI_PROVIDER')
        private readonly fibonacciWorker: FunctionThread<[num: number], number>
    ) {}

    async thread(num: number): Promise<number>
    {
        return await this.fibonacciWorker(num);
    }

    normal(num: number): number
    {
        return fibonacci(num);
    }
}
