import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { NotificationsGateway } from './notifications.gateway';
import { Notification } from '../entities/notification.entity';
import { NotificationsService } from './notifications.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification]),
        JwtModule.register({
            secretOrPrivateKey: 'secretKey',
            signOptions: {
                expiresIn: 3600,
            },
        }),
    ],
    providers: [NotificationsGateway, NotificationsService],
    exports: [NotificationsGateway, NotificationsService],
})
export class NotificationsModule {}