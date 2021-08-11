import { expose } from 'threads/worker';
// import { fibonacci } from './fibonacci';

function fibonacci(num: number): number
{
    if (num <= 1)
        return 1;

    return fibonacci(num - 1) + fibonacci(num - 2);
}

export type Fibonacci = typeof fibonacci

expose(fibonacci);
