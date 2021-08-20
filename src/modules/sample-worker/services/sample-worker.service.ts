import { Inject, Injectable } from '@nestjs/common';
import { FunctionThread } from 'threads';
import { QueuedTask } from 'threads/dist/master/pool';
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

    thread(num: number): Promise<number>
    {
        return this.fibonacciThread(num);
    }

    threadPool(num: number): QueuedTask<FunctionThread, number>
    {
        return this.fibonacciThreadPool
            .queue(f => f(num));
    }

    normal(num: number): number
    {
        return fibonacci(num);
    }
}
