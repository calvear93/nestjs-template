import {
	DocumentBuilder,
	SwaggerModule,
	type SwaggerCustomOptions,
} from '@nestjs/swagger';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { NestFactory } from '@nestjs/core';
import { type INestApplication } from '@nestjs/common';
import { ZodValidationPipe, registerDtoOpenApiSchemas } from '@libs/zod';
import {
	APY_KEY_GUARD_NAME,
	SECURITY_API_SCHEMA,
} from './decorators/api-key.guard.ts';
import { AppModule } from './app.module.ts';

/**
 * Swagger base configuration.
 *
 * @param app - app bootstrap
 */
export const addSwagger = (app: INestApplication, prefix: string) => {
	const config = new DocumentBuilder()
		.setTitle(process.env.APP_NAME)
		.setVersion(process.env.APP_VERSION)
		.addApiKey(SECURITY_API_SCHEMA, APY_KEY_GUARD_NAME)
		.build();

	const document = SwaggerModule.createDocument(app, config);

	// register zod DTOs
	registerDtoOpenApiSchemas(document);

	SwaggerModule.setup(prefix, app, document, {
		customSiteTitle: process.env.TITLE,
		jsonDocumentUrl: `${prefix}/openapi`,
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

	await app.listen(port, '0.0.0.0');

	return app;
};
