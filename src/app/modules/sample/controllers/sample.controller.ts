import {
	Body,
	Controller,
	Get,
	ParseIntPipe,
	Post,
	Query,
} from '@nestjs/common';
import { SampleControllerDocs } from './sample.controller.docs.ts';
import { SampleService } from '../services/sample.service.ts';
import { SampleDto } from '../schemas/sample.dto.ts';
import { ApplyControllerDocs } from '../../../decorators/docs.decorator.ts';
import { AllowAnonymous, ApiKey } from '../../../decorators/api-key.guard.ts';

@ApiKey()
@Controller({
	path: 'basic',
	version: '1',
})
@ApplyControllerDocs(SampleControllerDocs)
export class SampleController {
	constructor(private readonly _service: SampleService) {}

	/**
	 * Returns a hello world.
	 *
	 * @returns sample string
	 */
	@Get()
	@AllowAnonymous()
	run(): string {
		return this._service.sample();
	}

	/**
	 * Sums two numbers.
	 *
	 * @returns sum result
	 */
	@Get('/sum')
	sum(
		@Query('num1', ParseIntPipe) num1: number,
		@Query('num2', ParseIntPipe) num2: number,
	): number {
		return num1 + num2;
	}

	/**
	 * Receives, validate and returns a DTO
	 *
	 * @returns dto
	 */
	@Post('/dto')
	dto(@Body() sample: SampleDto): SampleDto {
		return sample;
	}
}
