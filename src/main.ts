import { NestFactory } from '@nestjs/core';
import { MainModule } from 'main.module';
import { swaggerInit } from 'config';

/**
 * Initializes the app.
 */
async function bootstrap(): Promise<void>
{
    const app = await NestFactory.create(MainModule);

    swaggerInit(app);
    app.enableCors();
    app.setGlobalPrefix(process.env.GLOBAL_API_PREFIX);

    await app.listen(process.env.PORT);
}

bootstrap();
