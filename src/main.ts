import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { swaggerInit } from 'app/config';
import { MainModule } from 'app/main.module';

/**
 * Initializes the app.
 */
async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(MainModule);

    app.enableCors();
    app.enableVersioning();
    app.setGlobalPrefix(process.env.API_PREFIX);
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            stopAtFirstError: true
        })
    );

    if (process.env.SWAGGER_UI === 'true') swaggerInit(app);

    await app.listen(+process.env.PORT);
}

bootstrap();
