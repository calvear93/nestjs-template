import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { ApplyControllerDocs } from '../../decorators/docs.decorator.ts';
import {
	type ___ControllerName___,
	___ControllerName___Schema,
} from './___controller-name___.schema.ts';
import { ___ControllerName___Service } from './___controller-name___.service.ts';
import { ___ControllerName___ControllerDocs } from './___controller-name___.controller.docs.ts';

/**
 * ___ControllerName___ controller.
 * NOTE: import it in your context module at 'controllers' array.
 *
 * @see https://docs.nestjs.com/controllers
 */
@Controller({ path: '___path___', version: '___version___' })
@ApplyControllerDocs(___ControllerName___ControllerDocs)
export class ___ControllerName___Controller {
	constructor(private service: ___ControllerName___Service) {}

	/**
	 * Return sample result.
	 *
	 * @returns returns a sample
	 */
	@Get()
	run(): string {
		return this.service.sample();
	}

	/**
	 * Receives, validates and returns a body.
	 *
	 * @param data - validated request body
	 * @returns the same data, echoed back
	 */
	@Post()
	create(
		@Body({ schema: ___ControllerName___Schema })
		data: ___ControllerName___,
	): ___ControllerName___ {
		return this.service.create(data);
	}

	private readonly _logger = new Logger(___ControllerName___Controller.name);
}
