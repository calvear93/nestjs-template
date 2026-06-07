import { Injectable } from '@nestjs/common';

/**
 * ___UseCaseName___ use case.
 * NOTE: import it in your context module at 'providers' array.
 *
 * @see https://docs.nestjs.com/providers
 */
@Injectable()
export class ___UseCaseName___UseCase {
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
