import { NestFactory } from '@nestjs/core';
import { MainModule } from 'main.module';
import { swaggerInit } from 'config';

async function bootstrap(): Promise<void>
{
    const app = await NestFactory.create(MainModule);

    swaggerInit(app);
    app.enableCors();

    await app.listen(process.env.PORT);
}

bootstrap();
