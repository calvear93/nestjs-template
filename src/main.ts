import { FastifyAdapter } from '@nestjs/platform-fastify';
import { NestFactory } from '@nestjs/core';
import { ZodValidationPipe } from './libs/zod/zod.pipe.ts';
import { swaggerInit } from './config/swagger.config.ts';
import { MainModule } from './app/main.module.ts';

const PORT = +process.env.PORT;
const PREFIX = process.env.API_PREFIX;
const SWAGGER_UI = process.env.SWAGGER_UI === 'true';
const onStart = () => {
	// eslint-disable-next-line no-console
	console.info(
		`\n \x1B[32m➜\x1B[0m Local: \x1B[36mhttp://localhost:${PORT}/${PREFIX}\x1B[0m`,
	);
};

// app initializing
const app = await NestFactory.create(MainModule, new FastifyAdapter(), {
	cors: true,
});

app.enableVersioning();
app.setGlobalPrefix(PREFIX);
app.useGlobalPipes(new ZodValidationPipe());

if (SWAGGER_UI) swaggerInit(app);

await app.listen(PORT, '0.0.0.0', onStart);

// disposing on hot reload dev
if (import.meta.hot) {
	import.meta.hot.on('vite:beforeFullReload', () => {
		return app.close();
	});
}
