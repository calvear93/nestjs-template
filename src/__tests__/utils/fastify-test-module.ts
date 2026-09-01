/* eslint-disable no-console */
import { StandardSchemaValidationPipe } from '@nestjs/common';
import {
	FastifyAdapter,
	type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { type TestingModule } from '@nestjs/testing';

export const createFastifyApplication = async (
	module: TestingModule,
	debug = false,
): Promise<NestFastifyApplication> => {
	const adapter = new FastifyAdapter();

	if (debug) {
		console.debug('\n\u001B[4m\u001B[33mFastify routes:\u001B[0m');

		adapter.getInstance().addHook('onRoute', ({ method, url }: any) => {
			if (method !== 'HEAD')
				console.debug(` ${method}: \u001B[34m${url}\u001B[0m`);
		});
	}

	const app = module.createNestApplication<NestFastifyApplication>(adapter);

	// mirrors the global pipe registered in src/app/app.ts's start() — without
	// it, integration tests never actually exercise request validation
	app.useGlobalPipes(new StandardSchemaValidationPipe());

	await app.enableVersioning().init();
	await app.getHttpAdapter().getInstance().ready();

	return app;
};
