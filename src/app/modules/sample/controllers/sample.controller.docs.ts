import { HttpStatusCode } from '#libs/http';
import {
	ApiOperation,
	ApiProduces,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { type DecoratorsLookUp } from '../../../../libs/decorators/apply.decorator.ts';
import { SampleDto } from '../schemas/sample.dto.ts';
import { type SampleController } from './sample.controller.ts';

export const SampleControllerDocs: DecoratorsLookUp<SampleController> = {
	class: [ApiTags('Sample')],
	method: {
		dto: [
			ApiOperation({
				summary: 'Receives, validate and returns a DTO',
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
			ApiResponse({
				description: 'Internal error',
				status: 500,
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
			ApiResponse({
				description: 'Internal error',
				status: 500,
			}),
		],
	},
};
