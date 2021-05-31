import { Injectable } from '@nestjs/common';

@Injectable()
export class SampleORMService
{
    sample()
    {
        return 'Hello World';
    }
}
