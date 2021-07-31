import { Inject, Injectable } from '@nestjs/common';
import { fibonacci } from '../utils/fibonacci';
import {
    FibonacciThread,
    FIBONACCI_THREAD_PROVIDER
} from '../providers/fibonacci-thread.provider';
import {
    FibonacciThreadPool,
    FIBONACCI_THREAD_POOL_PROVIDER
} from '../providers/fibonacci-thread-pool.provider';

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
        @Inject(FIBONACCI_THREAD_PROVIDER)
        private readonly fibonacciThread: FibonacciThread,
        @Inject(FIBONACCI_THREAD_POOL_PROVIDER)
        private readonly fibonacciThreadPool: FibonacciThreadPool
    ) {}

    async thread(num: number): Promise<number>
    {
        return await this.fibonacciThread(num);
    }

    async threadPool(num: number): Promise<number>
    {
        const task = this.fibonacciThreadPool
            .queue(fibonacci => fibonacci(num));

        return await task;
    }

    normal(num: number): number
    {
        return fibonacci(num);
    }
}
