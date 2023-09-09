import { mock } from 'vitest-mock-extended';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { Test, type TestingModule } from '@nestjs/testing';
import { type NestFastifyApplication } from '@nestjs/platform-fastify';
import { createFastifyApplication } from './utils/fastify-test-module.ts';
import { HttpMethod, HttpStatusCode } from '../libs/http/index.ts';
import { SampleService } from '../app/modules/sample/services/sample.service.ts';
import { MainModule } from '../app/main.module.ts';

describe(MainModule, () => {
	let _app: NestFastifyApplication;
	let _module: TestingModule;
	const _sampleServiceMock = mock<SampleService>({
		sample: () => 'Hello World Mock',
	});

	// hooks
	beforeAll(async () => {
		_module = await Test.createTestingModule({
			imports: [MainModule],
		})
			.overrideProvider(SampleService)
			.useValue(_sampleServiceMock)
			.compile();

		_app = await createFastifyApplication(_module, true);
	});

	afterAll(async () => {
		await _module.close();
		await _app.close();
	});

	// tests
	test('get /v1/basic should return Hello World', async () => {
		const expected = 'Hello World Mock';

		const { body, statusCode } = await _app.inject({
			method: HttpMethod.GET,
			url: '/v1/basic',
		});

		expect(statusCode).toBe(HttpStatusCode.OK);
		expect(body).toBe(expected);
	});

	test('get /v1/basic/sum should sum two number', async () => {
		const [num1, num2] = [1, 2];
		const expected = (num1 + num2).toString();

		const { body, statusCode } = await _app.inject({
			method: HttpMethod.GET,
			query: {
				num1: num1.toString(),
				num2: num2.toString(),
			},
			url: '/v1/basic/sum',
		});

		expect(statusCode).toBe(HttpStatusCode.OK);
		expect(body).toBe(expected);
	});
});
