import { NestFactory } from '@nestjs/core';
import { ZodValidationPipe } from './libs/zod/zod.pipe.js';
import { MainModule } from './app/main.module.js';
import { swaggerInit } from './app/config/swagger.config.js';

const app = await NestFactory.create(MainModule, { cors: true });

app.enableVersioning();
app.setGlobalPrefix(process.env.API_PREFIX);
app.useGlobalPipes(new ZodValidationPipe());

if (process.env.SWAGGER_UI === 'true') swaggerInit(app);

await app.listen(
	+process.env.PORT,
	// use '0.0.0.0' here as "hostname" arg if you use Fastify adapter
	() =>
		process.env.NODE_ENV === 'development' &&
		// eslint-disable-next-line no-console
		console.log(
			`\n \x1B[32m➜\x1B[0m Local: \x1B[36mhttp://localhost:${process.env.PORT}/${process.env.API_PREFIX}`,
		),
);
