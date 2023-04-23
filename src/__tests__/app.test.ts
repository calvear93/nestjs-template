import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, type INestApplication } from '@nestjs/common';
import { MainModule } from '../app/main.module.js';

describe('App', () => {
	let _app: INestApplication;

	// hooks
	beforeAll(async () => {
		const module = await Test.createTestingModule({
			imports: [MainModule],
		}).compile();

		_app = module.createNestApplication();
		_app.enableShutdownHooks();
		await _app.init();
	});

	afterAll(async () => {
		await _app.close();
	});

	// tests
	test('get basic should return Hello World', async () => {
		const expected = 'Hello World';

		const { statusCode, text } = await request(_app.getHttpServer())
			.get('/basic')
			.expect(200)
			.expect(expected);

		expect(statusCode).toBe(HttpStatus.OK);
		expect(text).toBe(expected);
	});

	test('get basic/sum should sum two number', async () => {
		const [num1, num2] = [1, 2];
		const expected = (num1 + num2).toString();

		const { statusCode, text } = await request(_app.getHttpServer())
			.get('/basic/sum')
			.query({ num1, num2 });

		expect(statusCode).toBe(HttpStatus.OK);
		expect(text).toBe(expected);
	});
});
