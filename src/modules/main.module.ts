import { Module } from '@nestjs/common';
import { AppController, AppService } from 'controllers/app';

@Module({
    imports: [],
    controllers: [ AppController ],
    providers: [ AppService ]
})
export class MainModule {}
