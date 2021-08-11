import { Test, TestingModule } from '@nestjs/testing';
import { SampleWorkerService } from '../services/sample-worker.service';
import { SampleWorkerController } from './sample-worker.controller';

describe('SampleController', () =>
{
    let controller: SampleWorkerController;

    beforeAll(async () =>
    {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ SampleWorkerService ],
            providers: [ SampleWorkerController ]
        }).compile();

        controller = module.get<SampleWorkerController>(SampleWorkerController);
    });

    test('should be defined', () =>
    {
        expect(controller).toBeDefined();
    });
});
