import { afterAll, beforeAll, describe, test } from 'vitest';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { type INestApplication } from '@nestjs/common';
import { SampleModule } from '../app/modules/index.js';

describe('Sample', () => {
	let app: INestApplication;

	// hooks
	beforeAll(async () => {
		const mainModule = await Test.createTestingModule({
			imports: [SampleModule],
		}).compile();

		app = mainModule.createNestApplication();
		app.enableShutdownHooks();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	// tests
	test('get basic should return Hello World', () => {
		const expected = 'Hello World';

		return request(app.getHttpServer())
			.get('/basic')
			.expect(200)
			.expect(expected);
	});
});
