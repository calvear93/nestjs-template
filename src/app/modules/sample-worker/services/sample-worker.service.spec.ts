import { Test } from '@nestjs/testing';
import { fibonacci } from '../utils/fibonacci';
import { SampleWorkerService } from './sample-worker.service';
import { FIBONACCI_THREAD_PROVIDER } from '../providers/fibonacci-thread.provider';
import { FIBONACCI_THREAD_POOL_PROVIDER } from '../providers/fibonacci-thread-pool.provider';

const fibonacciAsync = (num: number) => Promise.resolve(fibonacci(num));

describe('SampleWorkerService', () => {
    let service: SampleWorkerService;

    // fibonacci number for test
    const iteration = 10;
    // fibonacci result
    const expected = 55;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [
                SampleWorkerService,
                {
                    provide: FIBONACCI_THREAD_PROVIDER,
                    useFactory: () => fibonacciAsync
                },
                {
                    provide: FIBONACCI_THREAD_POOL_PROVIDER,
                    useFactory: () => fibonacciAsync
                }
            ]
        }).compile();

        service = module.get<SampleWorkerService>(SampleWorkerService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test(`normal ${iteration} fibonacci should return ${expected}`, () => {
        expect(service.normal(iteration)).toBe(expected);
    });

    test(`thread ${iteration} fibonacci should return ${expected}`, async () => {
        expect(await service.thread(iteration)).toBe(expected);
    });
});
