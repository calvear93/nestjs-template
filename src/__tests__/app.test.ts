import { HttpMethod, HttpStatusCode } from '#libs/http';
import { createFastifyApplication } from '#testing';
import { type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, type TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { AppModule } from '../app/app.module.ts';
import type { SampleDto } from '../app/modules/sample/schemas/sample.dto.ts';
import { SampleService } from '../app/modules/sample/services/sample.service.ts';

describe(AppModule, () => {
	let _app: NestFastifyApplication;
	let _module: TestingModule;
	const _sampleServiceMock = mock<SampleService>({
		sample: () => 'Hello World Mock',
	});

	// hooks
	beforeAll(async () => {
		_module = await Test.createTestingModule({
			imports: [AppModule],
		})
			.overrideProvider(SampleService)
			.useValue(_sampleServiceMock)
			.compile();

		_app = await createFastifyApplication(_module);
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
			url: '/v1/basic/sum',
			query: {
				num1: num1.toString(),
				num2: num2.toString(),
			},
		});

		expect(statusCode).toBe(HttpStatusCode.OK);
		expect(body).toBe(expected);
	});

	test('get /v1/basic/dto return same body sent', async () => {
		const expected: SampleDto = {
			id: 1,
			name: 'name',
		};

		const { json, statusCode } = await _app.inject({
			body: expected,
			method: HttpMethod.POST,
			url: '/v1/basic/dto',
		});
		const body = await json();

		expect(statusCode).toBe(HttpStatusCode.CREATED);
		expect(body).toStrictEqual(expected);
	});
});
