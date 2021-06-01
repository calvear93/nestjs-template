import { Injectable } from '@nestjs/common';

@Injectable()
export class SampleService
{
    sample(): string
    {
        return 'Hello World';
    }
}
