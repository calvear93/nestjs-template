import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { SampleModule, SampleWorkerModule } from 'app/modules';

describe('Sample e2e', () => {
    let app: INestApplication;

    // fibonacci number for test
    const iteration = 10;
    // fibonacci result
    const expected = '55';

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [SampleModule, SampleWorkerModule]
        }).compile();

        app = moduleRef.createNestApplication();
        app.enableShutdownHooks();
        await app.init();
    });

    it('/GET basic should return Hello World', () => {
        const expected = 'Hello World';

        return request(app.getHttpServer())
            .get('/basic')
            .expect(200)
            .expect(expected);
    });

    it(`/GET fibonacci, ${iteration} should be ${expected}`, () => {
        return request(app.getHttpServer())
            .get(`/worker/normal?num=${iteration}`)
            .expect(200)
            .expect(expected);
    });

    it(`/GET fibonacci thread, ${iteration} should be ${expected}`, () => {
        return request(app.getHttpServer())
            .get(`/worker/thread?num=${iteration}`)
            .expect(200)
            .expect(expected);
    });

    it(`/GET fibonacci thread pool, ${iteration} should be ${expected}`, () => {
        return request(app.getHttpServer())
            .get(`/worker/threadPool?num=${iteration}`)
            .expect(200)
            .expect(expected);
    });

    afterAll(async () => {
        await app.close();
    });
});
