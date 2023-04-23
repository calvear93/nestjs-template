import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, type INestApplication } from '@nestjs/common';
import { MainModule } from '../app/main.module.js';

describe('App', () => {
	let app: INestApplication;

	// hooks
	beforeAll(async () => {
		const mainModule = await Test.createTestingModule({
			imports: [MainModule],
		}).compile();

		app = mainModule.createNestApplication();
		app.enableShutdownHooks();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	// tests
	test('get basic should return Hello World', async () => {
		const expected = 'Hello World';

		const { statusCode, text } = await request(app.getHttpServer())
			.get('/basic')
			.expect(200)
			.expect(expected);

		expect(statusCode).toBe(HttpStatus.OK);
		expect(text).toBe(expected);
	});

	test('get basic/sum should sum two number', async () => {
		const [num1, num2] = [1, 2];
		const expected = (num1 + num2).toString();

		const { statusCode, text } = await request(app.getHttpServer())
			.get('/basic/sum')
			.query({ num1, num2 });

		expect(statusCode).toBe(HttpStatus.OK);
		expect(text).toBe(expected);
	});
});
