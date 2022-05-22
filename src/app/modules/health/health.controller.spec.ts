import { Test } from '@nestjs/testing';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

describe(HealthController.name, () => {
    let controller: HealthController;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [TerminusModule],
            controllers: [HealthController]
        }).compile();

        controller = module.get<HealthController>(HealthController);
    });

    test('should be defined', () => {
        expect(controller).toBeDefined();
    });

    test('should response ok', async () => {
        expect(await controller.check()).toMatchObject({ status: 'ok' });
    });
});
