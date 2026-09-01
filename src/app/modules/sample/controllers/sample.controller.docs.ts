import { HttpStatusCode } from '#libs/http';
import {
	ApiBody,
	ApiOperation,
	ApiProduces,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { type DecoratorsLookUp } from '../../../../libs/decorators/apply.decorator.ts';
import { SampleSchema } from '../schemas/sample.schema.ts';
import { type SampleController } from './sample.controller.ts';

export const SampleControllerDocs: DecoratorsLookUp<SampleController> = {
	class: [ApiTags('Sample')],
	common: {
		method: [
			ApiResponse({
				description: 'Internal error',
				status: 500,
			}),
		],
	},
	method: {
		dto: [
			ApiOperation({
				summary: 'Receives, validates and returns the sample payload',
			}),
			ApiBody({
				// `schema` here is inert: NestJS always overwrites it with the
				// schema derived (and correctly registered) from
				// @Body({ schema }) on the controller method — see #libs/zod's
				// README, "OpenAPI Integration". This placeholder only exists
				// to satisfy ApiBody's TypeScript signature, which requires
				// `schema` whenever `examples` is set.
				schema: { type: 'object' },
				examples: {
					example: {
						description: 'example',
						value: {
							id: 1,
							name: 'a name',
						},
					},
					'coercion-example': {
						description: 'coercion example',
						value: {
							id: '1',
							name: 'a name',
						},
					},
					'bad-example': {
						description: 'bad example',
						value: {
							id: 'not a number',
							name: 123,
						},
					},
				},
			}),
			ApiResponse({
				description: 'Sample',
				standardSchema: SampleSchema,
				status: HttpStatusCode.CREATED,
			}),
		],
		run: [
			ApiOperation({
				summary: 'Returns a hello world',
			}),
			ApiProduces('text/plain'),
			ApiResponse({
				description: 'Sample string',
				status: 200,
				type: String,
			}),
		],
		sum: [
			ApiOperation({
				summary: 'Sums two numbers',
			}),
			ApiQuery({
				name: 'num1',
				type: Number,
			}),
			ApiQuery({
				name: 'num2',
				type: Number,
			}),
			ApiProduces('text/plain'),
			ApiResponse({
				description: 'Sum result',
				status: 200,
				type: Number,
			}),
		],
	},
};
