import { Injectable, Provider } from '@nestjs/common';

/**
 * ___ProviderName___ provider.
 * NOTE: import it in your context module at 'providers' array.
 *
 * @see https://docs.nestjs.com/providers
 */
@Injectable()
export class ___ProviderName___Provider {
	/**
	 * Multiplies number by base number.
	 *
	 * @param value - any number
	 *
	 * @returns number multiplied by base number
	 */
	multiply(value: number): number {
		return value * this._baseNumber;
	}

	constructor(private readonly _baseNumber: number) {}

	/**
	 * Provider initializer for module.
	 *
	 * @param baseNumber - base number
	 *
	 * @returns provider
	 */
	static register(baseNumber: number): Provider<___ProviderName___Provider> {
		return {
			provide: ___ProviderName___Provider,
			inject: [
				/* your injected dependencies tokens here */
			],
			useFactory: (/* your dependencies from inject */) =>
				new ___ProviderName___Provider(baseNumber),
		};
	}
}
