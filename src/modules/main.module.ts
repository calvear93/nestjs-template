import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from 'common/guards';
import { AzureJwtService } from 'providers';
import { AuthController } from 'controllers/auth';

@Module({
    imports: [ JwtModule.register({ }) ],
    controllers: [ AuthController ],
    providers: [
        AzureJwtService,
        {
            provide: APP_GUARD,
            useClass: AuthGuard
        }
    ]
})
export class MainModule {}
