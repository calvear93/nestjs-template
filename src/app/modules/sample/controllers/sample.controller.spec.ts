import { Test, TestingModule } from '@nestjs/testing';
import { SampleService } from '../services/sample.service';
import { SampleController } from './sample.controller';

describe('SampleController', () => {
    // controller instance
    let controller: SampleController;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            controllers: [SampleController],
            providers: [SampleService]
        }).compile();

        controller = module.get<SampleController>(SampleController);
    });

    test('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
