import { Injectable } from '@nestjs/common';
import { SampleEntity, SampleEntityRepository } from 'database/schema';

@Injectable()
export class SampleORMService
{
    constructor(private sampleRepository: SampleEntityRepository) {}

    getByName(searchedName: string): Promise<SampleEntity | undefined>
    {
        return this.sampleRepository.findOne({ where: { searchName: searchedName.toLowerCase() } });
    }

    create(name: string): Promise<SampleEntity>
    {
        const entity = new SampleEntity();

        entity.name = name;
        entity.isActive = true;

        return this.sampleRepository.save(entity);
    }
}
