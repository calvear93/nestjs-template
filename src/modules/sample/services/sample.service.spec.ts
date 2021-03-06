import { Test, TestingModule } from '@nestjs/testing';
import { SampleService } from './sample.service';

describe('SampleService', () =>
{
    let service: SampleService;

    beforeEach(async () =>
    {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ SampleService ]
        }).compile();

        service = module.get<SampleService>(SampleService);
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
