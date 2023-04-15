import {
	SwaggerModule,
	DocumentBuilder,
	type SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { type INestApplication } from '@nestjs/common';
import {
	APY_KEY_GUARD_NAME,
	SECURITY_API_SCHEMA,
} from '../decorators/api-key.guard.js';
import { registerDtoSchemas } from '../../libs/zod/create-zod-dto.js';

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
			tryItOutEnabled: true,
			persistAuthorization: true,
			displayRequestDuration: true,
		} as SwaggerDocumentOptions,
	});
};
