import { EntityRepository, Repository } from 'typeorm';
import { SampleEntity } from './SampleEntity.entity';

/**
 * Sample repository.
 *
 * @class SampleEntityRepository
 * @augments Repository<SampleEntity>
 */
export class SampleEntityRepository extends Repository<SampleEntity> {
    /**
     * Searches by name.
     *
     * @param {string} searchedName searched name
     * @returns {Promise<SampleEntity | null>} searched entity
     */
    findByName(searchedName: string): Promise<SampleEntity | null> {
        return this.findOne({
            where: { searchName: searchedName.toLowerCase() }
        });
    }
}
