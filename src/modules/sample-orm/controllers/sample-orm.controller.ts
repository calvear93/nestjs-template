import { ClassSerializerInterceptor, Controller, Get, NotFoundException, Post, Query, UseInterceptors } from '@nestjs/common';
import { SampleEntity } from 'database/default';
import { SampleORMService } from '../services';

/**
 * Sample TypeORM module.
 *
 * @export
 * @class SampleORMController
 */
@Controller('sample/orm')
export class SampleORMController
{
    /**
     * Creates an instance of SampleORMController.
     *
     * @param {SampleORMService} service sample orm service
     */
    constructor(private service: SampleORMService) {}

    /**
     * Retrieves a sample entity by name.
     *
     * @param {string} name entity name
     *
     * @throws {NotFoundException} on entity not found
     * @returns {SampleEntity | undefined} entity
     */
    @Get()
    @UseInterceptors(ClassSerializerInterceptor)
    async getByName(@Query('name') name: string): Promise<SampleEntity | undefined>
    {
        const entity = await this.service.getByName(name);

        if (!entity)
            throw new NotFoundException();

        return entity;
    }

    /**
     * Creates a new entity with a name.
     *
     * @param {string} name name for new entity
     *
     * @returns {SampleEntity} created entity
     */
    @Post()
    create(@Query('name') name: string): Promise<SampleEntity>
    {
        return this.service.create(name);
    }
}
