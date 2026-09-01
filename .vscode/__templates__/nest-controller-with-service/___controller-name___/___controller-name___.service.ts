import { Injectable } from '@nestjs/common';
import { type ___ControllerName___ } from './___controller-name___.schema.ts';

/**
 * ___ControllerName___ service.
 * NOTE: import it in your context module at 'providers' array.
 *
 * @see https://docs.nestjs.com/providers
 */
@Injectable()
export class ___ControllerName___Service {
	constructor() {}

	/**
	 * Returns Hello World.
	 *
	 * @returns hello world
	 */
	sample(): string {
		return 'Hello World';
	}

	/**
	 * Creates a resource from validated data.
	 *
	 * @param data - validated input
	 * @returns the created resource
	 */
	create(data: ___ControllerName___): ___ControllerName___ {
		return data;
	}
}
