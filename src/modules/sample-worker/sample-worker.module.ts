import { Thread } from 'threads';
import { Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { SampleWorkerController } from './controllers/sample-worker.controller';
import { SampleWorkerService } from './services/sample-worker.service';
import {
    FibonacciThreadProvider,
    FibonacciThread,
    FIBONACCI_THREAD_PROVIDER
} from './providers/fibonacci-thread.provider';
import {
    FibonacciThreadPoolProvider,
    FibonacciThreadPool,
    FIBONACCI_THREAD_POOL_PROVIDER
} from './providers/fibonacci-thread-pool.provider';

/**
 * Sample worker module.
 *
 * @description providers tokens should be
 * used from constants source.
 * @class SampleWorkerModule
 */
@Module({
    controllers: [SampleWorkerController],
    providers: [
        SampleWorkerService,
        FibonacciThreadProvider,
        FibonacciThreadPoolProvider
    ]
})
export class SampleWorkerModule implements OnModuleDestroy {
    constructor(
        @Inject(FIBONACCI_THREAD_PROVIDER)
        private readonly fibonacciWorker: FibonacciThread,
        @Inject(FIBONACCI_THREAD_POOL_PROVIDER)
        private readonly fibonacciThreadPool: FibonacciThreadPool
    ) {}

    async onModuleDestroy(): Promise<void> {
        // disposes provider on application closing
        await Thread.terminate(this.fibonacciWorker);

        // disposes thread pool
        await this.fibonacciThreadPool.terminate();
    }
}
