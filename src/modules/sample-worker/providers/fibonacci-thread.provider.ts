import { FunctionThread, spawn, Worker } from 'threads';
import { Fibonacci } from './fibonacci.worker';

export const FIBONACCI_THREAD_PROVIDER = 'FIBONACCI_THREAD_PROVIDER';

export type FibonacciThread = FunctionThread<[num: number], number>;

// exports Fibonacci thread provider
export const FibonacciThreadProvider = {
    provide: FIBONACCI_THREAD_PROVIDER,
    useFactory: () => spawn<Fibonacci>(new Worker('./fibonacci.worker'))
};
