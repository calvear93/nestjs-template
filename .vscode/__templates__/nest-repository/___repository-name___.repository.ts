import { Injectable, Provider } from '@nestjs/common';

/**
 * ___RepositoryName___ Repository.
 * NOTE: import it in your context module at 'providers' array.
 *
 * @see https://docs.nestjs.com/Providers
 */
@Injectable()
export class ___RepositoryName___Repository {
	/**
	 * Returns sample phrase
	 *
	 * @returns sample phrase
	 */
	sample(): string {
		return 'Hello World';
	}

	constructor() {}

	/**
	 * Repository initializer for module.
	 *
	 * @returns Repository
	 */
	static register(): Provider<___RepositoryName___Repository> {
		return {
			provide: ___RepositoryName___Repository,
			inject: [], // your injected dependencies tokens here
			useFactory: (/* your dependencies from inject */) =>
				new ___RepositoryName___Repository(),
		};
	}
}
