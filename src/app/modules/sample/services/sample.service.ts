import { Injectable } from '@nestjs/common';

@Injectable()
export class SampleService {
	/**
	 * Returns Hello World.
	 *
	 * @returns sample string
	 */
	sample(): string {
		return 'Hello World';
	}
}
