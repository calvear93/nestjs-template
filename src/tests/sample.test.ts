import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { SampleModule } from 'app/modules';

describe('Sample', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [SampleModule]
        }).compile();

        app = moduleRef.createNestApplication();
        app.enableShutdownHooks();
        await app.init();
    });

    test('GET basic should return Hello World', () => {
        const expected = 'Hello World';

        return request(app.getHttpServer())
            .get('/basic')
            .expect(200)
            .expect(expected);
    });

    afterAll(async () => {
        await app.close();
    });
});
