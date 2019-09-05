import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';
import { UserModule } from './user/user/user.module';
import { OrderModule } from './order/order.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useStaticAssets(join(__dirname, '/../public'));

  // Setup Swagger Documentation
  // setup Users
  const userDoc = new DocumentBuilder()
    .setTitle('Users API')
    .setDescription('API for CRUD of Users and Authentication')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  let document = SwaggerModule.createDocument(app, userDoc, {include: [UserModule]});
  SwaggerModule.setup('api/users', app, document);

  // setup Orders
  const orderDoc = new DocumentBuilder()
    .setTitle('Orders API')
    .setDescription('API for CRUD of Orders')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  document = SwaggerModule.createDocument(app, orderDoc, {include: [OrderModule]});
  SwaggerModule.setup('api/orders', app, document);

  await app.listen(9000);
}
bootstrap();
