import {
	ApiBody,
	ApiOperation,
	ApiProduces,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { HttpStatusCode } from '#libs/http';
import { type DecoratorsLookUp } from '../../../../libs/decorators/apply.decorator.ts';
import { SampleDto } from '../schemas/sample.dto.ts';
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
				summary: 'Receives, validate and returns a DTO',
			}),
			ApiBody({
				schema: SampleDto.jsonSchema,
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
				description: 'DTO',
				schema: SampleDto.jsonSchema,
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
