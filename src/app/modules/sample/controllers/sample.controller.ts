import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { SampleControllerDocs } from './sample.controller.docs.js';
import { SampleService } from '../services/sample.service.js';
import { ApplyControllerDocs } from '../../../decorators/docs.decorator.js';

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
}
