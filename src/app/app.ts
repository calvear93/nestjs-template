import {
	DocumentBuilder,
	SwaggerModule,
	type SwaggerCustomOptions,
} from '@nestjs/swagger';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { NestFactory } from '@nestjs/core';
import { type INestApplication } from '@nestjs/common';
import {
	APY_KEY_GUARD_NAME,
	SECURITY_API_SCHEMA,
} from './decorators/api-key.guard.ts';
import { AppModule } from './app.module.ts';
import { ZodValidationPipe } from '../libs/zod/zod.pipe.ts';
import { registerDtoOpenApiSchemas } from '../libs/zod/create-zod-dto.ts';

/**
 * Swagger base configuration.
 *
 * @param app - app bootstrap
 */
export const addSwagger = (app: INestApplication, prefix: string) => {
	const config = new DocumentBuilder()
		.setTitle(process.env.TITLE)
		.setDescription(process.env.DESCRIPTION)
		.setVersion(process.env.VERSION)
		.addApiKey(SECURITY_API_SCHEMA, APY_KEY_GUARD_NAME)
		.build();

	const document = SwaggerModule.createDocument(app, config);

	// register zod DTOs
	registerDtoOpenApiSchemas(document);

	SwaggerModule.setup(prefix, app, document, {
		customSiteTitle: process.env.TITLE,
		swaggerOptions: {
			displayRequestDuration: true,
			persistAuthorization: true,
			tryItOutEnabled: true,
		},
	} satisfies SwaggerCustomOptions);
};

export interface AppStartConfig {
	port?: number;
	prefix: string;
	swagger?: boolean;
}

/**
 * App initializing.
 *
 * @param port - HTTP server port
 * @param prefix - base prefix
 * @param swagger - if swagger is enabled
 */
export const start = async ({ port = 0, prefix, swagger }: AppStartConfig) => {
	const adapter = new FastifyAdapter();
	const app = await NestFactory.create(AppModule, adapter, {
		cors: true,
	});

	app.enableVersioning();
	app.setGlobalPrefix(prefix);
	app.useGlobalPipes(new ZodValidationPipe());

	if (swagger) addSwagger(app, prefix);

	await app.listen(port, '0.0.0.0', () => {
		// eslint-disable-next-line no-console
		console.info(
			`\n \x1B[32m➜\x1B[0m Local: \x1B[36mhttp://localhost:${port}/${prefix}\x1B[0m`,
		);
	});

	return app;
};
