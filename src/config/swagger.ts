import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export default (app : INestApplication) =>
{
    const config = new DocumentBuilder()
        .setTitle(process.env.TITLE)
        .setDescription(process.env.DESCRIPTION)
        .setVersion(process.env.VERSION)
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('', app, document);
};
