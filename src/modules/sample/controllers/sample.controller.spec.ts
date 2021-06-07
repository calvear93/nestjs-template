import { Test, TestingModule } from '@nestjs/testing';
import { SampleController } from './sample.controller';
import { SampleService } from '../services';

describe('SampleController', () =>
{
    let controller: SampleController;

    beforeEach(async () =>
    {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ SampleController ],
            providers: [ SampleService ]
        }).compile();

        controller = module.get<SampleController>(SampleController);
    });

    test('should be defined', () =>
    {
        expect(controller).toBeDefined();
    });
});
