import { Injectable } from '@nestjs/common';

/**
 * ___ServiceName___ service.
 * NOTE: import it in your context module at 'providers' array.
 *
 * @see https://docs.nestjs.com/providers
 */
@Injectable()
export class ___ServiceName___Service {
	/**
	 * Sums two numbers.
	 *
	 * @param a - any number
	 * @param b - any number
	 *
	 * @returns sum
	 */
	sum(a: number, b: number): number {
		return a + b;
	}

	constructor() {}
}
