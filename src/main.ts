import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MainModule } from './app/main.module.js';
import { swaggerInit } from './app/config/swagger.config.js';

const app = await NestFactory.create(MainModule, { cors: true });

app.enableVersioning();
app.setGlobalPrefix(process.env.API_PREFIX);
app.useGlobalPipes(
	new ValidationPipe({
		whitelist: true,
		stopAtFirstError: true,
		transform: true,
	})
);

if (process.env.SWAGGER_UI === 'true') swaggerInit(app);

await app.listen(
	+process.env.PORT,
	() =>
		process.env.NODE_ENV === 'development' &&
		// eslint-disable-next-line no-console
		console.log(
			`\n \x1B[32m➜\x1B[0m Local: \x1B[36mhttp://localhost:${process.env.PORT}/${process.env.API_PREFIX}`
		)
);
