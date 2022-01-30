import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

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
        customCssUrl:
            'https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.1/themes/3.x/theme-flattop.css',
        customSiteTitle: process.env.TITLE,
        swaggerOptions: {
            tryItOutEnabled: true,
            persistAuthorization: true,
            displayRequestDuration: true
        }
    });
};
