import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

/**
 * Swagger base configuration.
 *
 * @param {INestApplication} app app bootstrap
 */
export const swaggerInit = (app: INestApplication) =>
{
    const config = new DocumentBuilder()
        .setTitle(process.env.TITLE)
        .setDescription(process.env.DESCRIPTION)
        .setVersion(process.env.VERSION)
        .addServer('v1')
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup(process.env.API_PREFIX, app, document);
};
