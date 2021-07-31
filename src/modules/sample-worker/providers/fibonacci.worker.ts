import { expose } from 'threads/worker';
import { fibonacci } from '../utils/fibonacci';

export type Fibonacci = typeof fibonacci

expose(fibonacci);
