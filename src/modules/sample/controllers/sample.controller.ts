import { SampleService } from '../services';
import { Controller, Get } from '@nestjs/common';

@Controller('sample')
export class SampleController
{
    constructor(private service: SampleService) {}

    @Get()
    sample(): any
    {
        return this.service.sample();
    }
}
