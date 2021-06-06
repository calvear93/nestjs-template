import { EntityRepository, Repository } from 'typeorm';
import { SampleEntity } from './sample.entity';

/**
 * Sample repository.
 *
 * @export
 * @class SampleEntityRepository
 * @extends Repository<SampleEntity>
 */
@EntityRepository(SampleEntity)
export class SampleEntityRepository extends Repository<SampleEntity> {}
