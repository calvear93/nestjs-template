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
	 * Initializes provider.
	 */
	init(): Promise<void> {
		return Promise.resolve();
	}

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
	static register(
		baseNumber: number,
	): Provider<Promise<___ProviderName___Provider>> {
		return {
			provide: ___ProviderName___Provider,
			inject: [
				/* your injected dependencies tokens here */
			],
			useFactory: async (/* your dependencies from inject */) => {
				const provider = new ___ProviderName___Provider(baseNumber);

				await provider.init();

				return provider;
			},
		};
	}
}
