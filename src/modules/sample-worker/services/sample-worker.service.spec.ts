import { Test, TestingModule } from '@nestjs/testing';
import { fibonacci } from '../utils/fibonacci';
import { SampleWorkerService } from './sample-worker.service';

describe('SampleWorkerService', () =>
{
    let service: SampleWorkerService;

    beforeAll(async () =>
    {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SampleWorkerService,
                {
                    provide: 'FIBONACCI_PROVIDER',
                    useFactory: () => (num: number) => Promise.resolve(fibonacci(num))
                }
            ]
        }).compile();

        service = module.get<SampleWorkerService>(SampleWorkerService);
    });

    test('should be defined', () =>
    {
        expect(service).toBeDefined();
    });

    test('normal fibonacci with 10 iterations should return 89', () =>
    {
        const input = 10;
        const expected = 89;

        expect(service.normal(input)).toBe(expected);
    });

    test('thread fibonacci with 10 iterations should return 89', async () =>
    {
        const input = 10;
        const expected = 89;

        expect(await service.thread(input)).toBe(expected);
    });
});
