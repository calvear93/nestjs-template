import { expose } from 'threads/worker';
import { fibonacci } from '../utils/fibonacci';

// exports function type
export type Fibonacci = typeof fibonacci

// exposes function as worker thread
expose(fibonacci);
