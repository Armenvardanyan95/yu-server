import { Module, MulterModule } from '@nestjs/common';
import { diskStorage } from 'multer';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserModule } from '../user/user/user.module';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { extname, join } from 'path';

@Module({
    imports: [
        TypeOrmModule.forFeature([Chat, Message]),
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
    controllers: [MessagesController],
    providers: [MessagesService, MessagesGateway],
})
export class MessagesModule {}