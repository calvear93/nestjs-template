import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from 'common/guards';
import { AzureJwtService } from 'providers';
import { AuthController } from 'controllers/auth';
import { SampleController } from 'controllers/sample';

@Module({
    imports: [ JwtModule.register({ }) ],
    controllers: [ AuthController, SampleController ],
    providers: [
        AzureJwtService,
        {
            provide: APP_GUARD,
            useClass: AuthGuard
        }
    ]
})
export class MainModule {}
