import { NestFactory } from '@nestjs/core';
import { swaggerInit } from 'config';
import { MainModule } from 'modules';

async function bootstrap()
{
    const app = await NestFactory.create(MainModule);

    swaggerInit(app);

    await app.listen(3000);
}

bootstrap();
