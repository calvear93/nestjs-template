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
 * @class SampleWorkerService
 */
@Injectable()
export class SampleWorkerService {
    /**
     * Creates an instance of SampleWorkerService.
     *
     * @param {FibonacciThread} fibonacciThread fibonacci thread handler
     * @param {FibonacciThreadPool} fibonacciThreadPool fibonacci thread pool handler
     */
    constructor(
        @Inject(FIBONACCI_THREAD_PROVIDER)
        private readonly fibonacciThread: FibonacciThread,
        @Inject(FIBONACCI_THREAD_POOL_PROVIDER)
        private readonly fibonacciThreadPool: FibonacciThreadPool
    ) {}

    /**
     * Execute recursive
     * Fibonacci algorithm
     * in a Thread.
     *
     * Non main thread blocking.
     *
     * @param {number} num iteration
     * @returns {number} Fibonacci number
     */
    thread(num: number): Promise<number> {
        return this.fibonacciThread(num);
    }

    /**
     * Execute recursive
     * Fibonacci algorithm
     * in a Thread Pool.
     *
     * Non thread blocking and concurrent.
     *
     * @param {number} num iteration
     * @returns {number} Fibonacci number
     */
    threadPool(num: number): QueuedTask<FunctionThread, number> {
        return this.fibonacciThreadPool.queue((f) => f(num));
    }

    /**
     * Execute recursive
     * Fibonacci algorithm.
     *
     * @param {number} num iteration
     * @returns {number} Fibonacci number
     */
    normal(num: number): number {
        return fibonacci(num);
    }
}
