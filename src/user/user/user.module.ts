import { Module, MulterModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

import { CommonModule } from '../../common/common.module';
import { User } from '../../entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from '../../infrastructure/jwt.strategy';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secretOrPrivateKey: 'secretKey',
            signOptions: {
                expiresIn: 3600,
            },
        }),
        MulterModule.register({
            storage: diskStorage({
                destination: join(__dirname, '../../../public'),
                filename(req, file, cb) {
                    const randomName = Array(32).fill(null).map(() => (Math.ceil(Math.random() * 16)).toString(16)).join('');
                    cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
        }),
        CommonModule,
    ],
    exports: [PassportModule, JwtModule, UserService],
    providers: [UserService, AuthService, JwtStrategy],
    controllers: [UserController],
})
export class UserModule {}
