import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AdminGuard } from './guards';

@Module({
    imports: [JwtModule.register({
        secretOrPrivateKey: 'secretKey',
        signOptions: {
            expiresIn: 3600,
        },
    })],
    providers: [AdminGuard],
})
export class InfrastructureModule { }