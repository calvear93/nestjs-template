import { Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { FunctionThread, spawn, Thread, Worker } from 'threads';
import { SampleWorkerController } from './controllers/sample-worker.controller';
import { Fibonacci } from './services/fibonacci-thread';
import { SampleWorkerService } from './services/sample-worker.service';

/**
 * Sample worker module.
 *
 * @export
 * @class SampleModule
 */
@Module({
    controllers: [ SampleWorkerController ],
    providers: [
        SampleWorkerService,
        {
            provide: 'FIBONACCI_PROVIDER',
            useFactory: () => spawn<Fibonacci>(new Worker('./services/fibonacci-thread'))
        }
    ]
})
export class SampleWorkerModule implements OnApplicationShutdown
{
    constructor(
        @Inject('FIBONACCI_PROVIDER')
        private readonly fibonacciWorker: FunctionThread<[num: number], number>
    ) {}

    async onApplicationShutdown()
    {
        await Thread.terminate(this.fibonacciWorker);
    }
}
