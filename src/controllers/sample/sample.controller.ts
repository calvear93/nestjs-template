import { Controller, Get } from '@nestjs/common';

@Controller('sample')
export class SampleController
{
    @Get()
    sample(): any
    {
        return 'Hello World';
    }
}
