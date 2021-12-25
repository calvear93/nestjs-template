import { Injectable } from '@nestjs/common';

/**
 * Sample service.
 *
 * @class SampleService
 */
@Injectable()
export class SampleService {
    /**
     * Returns Hello World.
     *
     * @returns {string} sample string
     */
    sample(): string {
        return 'Hello World';
    }
}
