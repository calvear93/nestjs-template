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
import { registerDtoSchemas } from '../libs/zod/create-zod-dto.ts';

const PORT = +process.env.PORT;
const PREFIX = process.env.API_PREFIX;
const SWAGGER_UI = process.env.SWAGGER_UI === 'true';

/**
 * Swagger base configuration.
 *
 * @param app - app bootstrap
 */
export const addSwagger = (app: INestApplication) => {
	const config = new DocumentBuilder()
		.setTitle(process.env.TITLE)
		.setDescription(process.env.DESCRIPTION)
		.setVersion(process.env.VERSION)
		.addApiKey(SECURITY_API_SCHEMA, APY_KEY_GUARD_NAME)
		.build();

	const document = SwaggerModule.createDocument(app, config);

	registerDtoSchemas(document);

	SwaggerModule.setup(process.env.API_PREFIX, app, document, {
		customSiteTitle: process.env.TITLE,
		swaggerOptions: {
			displayRequestDuration: true,
			persistAuthorization: true,
			tryItOutEnabled: true,
		},
	} satisfies SwaggerCustomOptions);
};

/**
 * App initializing.
 */
export const start = async () => {
	const app = await NestFactory.create(AppModule, new FastifyAdapter(), {
		cors: true,
	});

	app.enableVersioning();
	app.setGlobalPrefix(PREFIX);
	app.useGlobalPipes(new ZodValidationPipe());

	if (SWAGGER_UI) addSwagger(app);

	await app.listen(PORT, '0.0.0.0', () => {
		// eslint-disable-next-line no-console
		console.info(
			`\n \x1B[32m➜\x1B[0m Local: \x1B[36mhttp://localhost:${PORT}/${PREFIX}\x1B[0m`,
		);
	});

	return app;
};
