/* eslint-disable no-console */
import { type TestingModule } from '@nestjs/testing';
import {
	FastifyAdapter,
	type NestFastifyApplication,
} from '@nestjs/platform-fastify';

export const createFastifyApplication = async (
	module: TestingModule,
	debug = false,
): Promise<NestFastifyApplication> => {
	const adapter = new FastifyAdapter();

	if (debug) {
		console.debug('\n\x1B[4m\x1B[33mFastify routes:\x1B[0m');

		adapter.getInstance().addHook('onRoute', ({ method, url }: any) => {
			if (method !== 'HEAD')
				console.debug(` ${method}: \x1B[34m${url}\x1B[0m`);
		});
	}

	const app = module.createNestApplication<NestFastifyApplication>(adapter);

	await app.enableVersioning().init();
	await app.getHttpAdapter().getInstance().ready();

	return app;
};
