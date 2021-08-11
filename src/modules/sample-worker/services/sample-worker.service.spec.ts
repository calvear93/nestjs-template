import { Test, TestingModule } from '@nestjs/testing';
import { SampleWorkerService } from './sample-worker.service';

describe('SampleService', () =>
{
    let service: SampleWorkerService;

    beforeAll(async () =>
    {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ SampleWorkerService ]
        }).compile();

        service = module.get<SampleWorkerService>(SampleWorkerService);
    });

    test('should be defined', () =>
    {
        expect(service).toBeDefined();
    });

    test('should return Hello World', () =>
    {
        expect(service.sample()).toBe('Hello World');
    });
});
