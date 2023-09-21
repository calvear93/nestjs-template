import {
	SwaggerModule,
	DocumentBuilder,
	type SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { type INestApplication } from '@nestjs/common';
import { registerDtoSchemas } from '../libs/zod/create-zod-dto.ts';
import {
	APY_KEY_GUARD_NAME,
	SECURITY_API_SCHEMA,
} from '../app/decorators/api-key.guard.ts';

/**
 * Swagger base configuration.
 *
 * @param app - app bootstrap
 */
export const swaggerInit = (app: INestApplication) => {
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
		} as SwaggerDocumentOptions,
	});
};
