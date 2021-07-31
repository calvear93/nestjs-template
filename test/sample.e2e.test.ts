import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { SampleModule, SampleWorkerModule } from 'modules';

describe('Sample e2e', () =>
{
    let app: INestApplication;

    beforeAll(async () =>
    {
        const moduleRef = await Test.createTestingModule({
            imports: [
                SampleModule,
                SampleWorkerModule
            ]
        }).compile();

        app = moduleRef.createNestApplication();
        app.enableShutdownHooks();
        await app.init();
    });

    it('/GET basic', () =>
    {
        const expected = 'Hello World';

        return request(app.getHttpServer())
            .get('/basic')
            .expect(200)
            .expect(expected);
    });

    it('/GET fibonacci', () =>
    {
        const input = 10;
        const expected = '89';

        return request(app.getHttpServer())
            .get(`/worker/normal?num=${input}`)
            .expect(200)
            .expect(expected);
    });

    it('/GET fibonacci thread', () =>
    {
        const input = 10;
        const expected = '89';

        return request(app.getHttpServer())
            .get(`/worker/thread?num=${input}`)
            .expect(200)
            .expect(expected);
    });

    it('/GET fibonacci thread pool', () =>
    {
        const input = 10;
        const expected = '89';

        return request(app.getHttpServer())
            .get(`/worker/threadPool?num=${input}`)
            .expect(200)
            .expect(expected);
    });

    afterAll(async () =>
    {
        await app.close();
    });
});
