import { Controller, Get, Post, Query } from '@nestjs/common';
import { SampleEntity } from 'database/schema';
import { SampleORMService } from '../services';

@Controller('sample/orm')
export class SampleORMController
{
    constructor(private service: SampleORMService) {}

    @Get()
    getByName(@Query('name') name: string): Promise<SampleEntity | undefined>
    {
        return this.service.getByName(name);
    }

    @Post()
    create(@Query('name') name: string): Promise<SampleEntity>
    {
        return this.service.create(name);
    }
}
