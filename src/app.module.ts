import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { UserModule } from './user/user/user.module';
import { OrderModule } from './order/order.module';
import { CommonModule } from '../src/common/common.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
      TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'current93',
          database: 'yur',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
      }),
      UserModule,
      OrderModule,
      NotificationsModule,
      CommonModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
