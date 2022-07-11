import { INestApplication } from '@nestjs/common';
import {
    SwaggerModule,
    DocumentBuilder,
    SwaggerDocumentOptions
} from '@nestjs/swagger';

/**
 * Swagger base configuration.
 *
 * @param {INestApplication} app app bootstrap
 */
export const swaggerInit = (app: INestApplication) => {
    const config = new DocumentBuilder()
        .setTitle(process.env.TITLE)
        .setDescription(process.env.DESCRIPTION)
        .setVersion(process.env.VERSION)
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup(process.env.API_PREFIX, app, document, {
        customSiteTitle: process.env.TITLE,
        swaggerOptions: {
            tryItOutEnabled: true,
            persistAuthorization: true,
            displayRequestDuration: true
        } as SwaggerDocumentOptions
    });
};
