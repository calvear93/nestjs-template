import { Test } from '@nestjs/testing';
import { SampleService } from './sample.service';

describe('SampleService', () => {
    // service instance
    let service: SampleService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [SampleService]
        }).compile();

        service = module.get<SampleService>(SampleService);
    });

    test('should be defined', () => {
        expect(service).toBeDefined();
    });

    test('should return Hello World', () => {
        expect(service.sample()).toBe('Hello World');
    });
});
