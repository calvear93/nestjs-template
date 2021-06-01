import { Controller, Get } from '@nestjs/common';
import { SampleService } from '../services';

@Controller('sample')
export class SampleController
{
    constructor(private service: SampleService) {}

    @Get()
    sample(): string
    {
        return this.service.sample();
    }
}
