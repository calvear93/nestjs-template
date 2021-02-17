import { NestFactory } from '@nestjs/core';
import { swaggerInit } from 'config';
import { MainModule } from 'modules';

async function bootstrap()
{
    const app = await NestFactory.create(MainModule);

    swaggerInit(app);
    app.enableCors();

    await app.listen(process.env.PORT);
}

bootstrap();
