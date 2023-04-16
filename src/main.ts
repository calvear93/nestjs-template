import { NestFactory } from '@nestjs/core';
import { ZodValidationPipe } from './libs/zod/zod.pipe.js';
import { MainModule } from './app/main.module.js';
import { swaggerInit } from './app/config/swagger.config.js';

const DEV = process.env.NODE_ENV === 'development';
const PORT = +process.env.PORT;
const PREFIX = process.env.API_PREFIX;
const SWAGGER_UI = process.env.SWAGGER_UI === 'true';

const app = await NestFactory.create(MainModule, { cors: true });

app.enableVersioning();
app.setGlobalPrefix(PREFIX);
app.useGlobalPipes(new ZodValidationPipe());

if (SWAGGER_UI) swaggerInit(app);

await app.listen(
	PORT,
	// use '0.0.0.0' here as "hostname" arg if you use Fastify adapter
	() =>
		DEV &&
		// eslint-disable-next-line no-console
		console.log(
			`\n \x1B[32m➜\x1B[0m Local: \x1B[36mhttp://localhost:${PORT}/${PREFIX}`,
		),
);
