import { Controller, Get } from '@nestjs/common';
import { SampleORMService } from '../services';

@Controller('sample/orm')
export class SampleORMController
{
    constructor(private service: SampleORMService) {}

    @Get()
    sample(): any
    {
        return this.service.sample();
    }
}
