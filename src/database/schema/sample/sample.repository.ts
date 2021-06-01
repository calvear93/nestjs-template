import { EntityRepository, Repository } from 'typeorm';
import { SampleEntity } from './sample.entity';

@EntityRepository(SampleEntity)
export class SampleEntityRepository extends Repository<SampleEntity> {}
