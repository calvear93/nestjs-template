import {
	ApiOperation,
	ApiQuery,
	ApiResponse,
	ApiTags,
	ApiProduces,
} from '@nestjs/swagger';
import { type SampleController } from './sample.controller.js';
import { type DecoratorsLookUp } from '../../../../libs/decorators/apply.decorator.js';

export const SampleControllerDocs: DecoratorsLookUp<SampleController> = {
	class: [ApiTags('Sample')],
	method: {
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
