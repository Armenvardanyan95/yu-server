import { Module, MulterModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { diskStorage } from 'multer';
import { join, extname } from 'path';

import { Order } from '../entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { UserModule } from '../user/user/user.module';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Order]),
        UserModule,
        NotificationsModule,
        MulterModule.register({
            storage: diskStorage({
                destination: join(__dirname, '../../public'),
                filename(req, file, cb) {
                    const randomName = Array(32).fill(null).map(() => (Math.ceil(Math.random() * 16)).toString(16)).join('');
                    cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
        }),
    ],
    controllers: [OrderController],
    providers: [OrderService],
})
export class OrderModule {}
