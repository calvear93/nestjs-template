import { FunctionThread, Pool, spawn, Worker } from 'threads';
import { Fibonacci } from './fibonacci.worker';

export const FIBONACCI_THREAD_POOL_PROVIDER = 'FIBONACCI_THREAD_POOL_PROVIDER';

export type FibonacciThreadPool = Pool<FunctionThread<[num: number], number>>;

// exports Fibonacci thread pool provider
export const FibonacciThreadPoolProvider = {
    provide: FIBONACCI_THREAD_POOL_PROVIDER,
    useFactory: (): FibonacciThreadPool =>
        Pool(() => spawn<Fibonacci>(new Worker('./fibonacci.worker')))
};
