import { Injectable } from '@nestjs/common';
import { SampleEntity, SampleEntityRepository } from 'app/database/default';

/**
 * Sample TypeORM service.
 *
 * @class SampleORMService
 */
@Injectable()
export class SampleORMService {
    /**
     * Creates an instance of SampleORMService.
     *
     * @param {SampleEntityRepository} sampleRepository sample entity repository
     */
    constructor(private readonly _repository: SampleEntityRepository) {}

    /**
     * Retrieves an entity from database by name.
     *
     * @param {string} searchedName entity name
     * @returns {Promise<SampleEntity | null>} searched entity
     */
    getByName(searchedName: string): Promise<SampleEntity | null> {
        return this._repository.findByName(searchedName);
    }

    /**
     * Creates a new entity in database with a name
     *
     * @param {string} name entity name
     * @returns {Promise<SampleEntity>} created entity
     */
    create(name: string): Promise<SampleEntity> {
        const entity = new SampleEntity({ name });

        return this._repository.save(entity);
    }
}
