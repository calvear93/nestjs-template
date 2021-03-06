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
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup(process.env.GLOBAL_API_PREFIX, app, document);
};
