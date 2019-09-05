import {
    Controller, Post, Body, Get, Param, UseGuards, UsePipes, Delete, FileInterceptor, UploadedFile,
    UseInterceptors, Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

import { UserService } from './user.service';
import { SignInOptionsDto, UserModelDto, UserVerifyDto, ForgotPasswordDto, UpdatePasswordDto } from '../../infrastructure/dto';
import { ErrorResponse, SuccessResponse } from '../../infrastructure/responses';
import { Schema, Validations } from '../../infrastructure/schemas';
import { ValidationPipe } from '../../infrastructure/pipes';
import { User } from '../../entities/user.entity';
import { AdminGuard } from '../../infrastructure/guards';
import { CurrentUser } from '../../infrastructure/decorators';
import { EmailService } from '../../common/services/email.service';
import { PayloadModel, FileModel } from 'src/infrastructure/models';

@Controller('user')
export class UserController {

    private static signInSchema: Schema = new Schema([
        ['email', [Validations.Required, Validations.Email]],
        ['password', [Validations.Required]],
    ]);

    private static signUpSchema = new Schema([
        ['email', [Validations.Required, Validations.Email]],
        ['password', [Validations.Required]],
        ['firstName', [Validations.Required]],
        ['lastName', [Validations.Required]],
        ['confirmPassword', [Validations.Required]],
    ]);

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
    ) {}

    @Post()
    @UsePipes(new ValidationPipe(UserController.signUpSchema))
    async createUser(@Body() userData: UserModelDto) {
        if (userData.password !== userData.confirmPassword) {
            return new ErrorResponse('Passwords do not match');
        } else if (await this.userService.isExistingUser(userData.email)) {
            return new ErrorResponse('USER_ALREADY_EXISTS');
        } else {
            try {
                const createdUser = await this.userService.createUser(userData);
                const confirmationToken = this.jwtService.sign({id: createdUser.id, date: new Date()});
                await this.emailService.sendConfirmationEmail(createdUser.email, confirmationToken);
                return new SuccessResponse(createdUser);
            } catch (error) {
                return new ErrorResponse(error.message);
            }
        }
    }

    @Post('/edit')
    @ApiBearerAuth()
    @UseGuards(AuthGuard())
    async updateUser(@Body() userData: Partial<UserModelDto>, @CurrentUser() user: User) {
        try {
            const updatedUser: User = await this.userService.updateUser(userData, user.id);
            return new SuccessResponse(updatedUser);
        } catch (error) {
            return new ErrorResponse(error.message);
        }
    }

    @Post('/verify')
    async verifyUser(@Body() {token}: UserVerifyDto) {
        const {payload}: {payload: PayloadModel} = this.jwtService
                .decode(token, {complete: true, json: true}) as {payload: PayloadModel};
        const id = payload.id;
        try {
            await this.userService.verify(id);
            return new SuccessResponse();
        } catch (error) {
            return new ErrorResponse(error.message);
        }
    }

    @Get()
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), AdminGuard)
    async getUsers() {
        try {
            const users = await this.userService.findAll();
            return new SuccessResponse(users);
        } catch (error) {
            return new ErrorResponse(error.message);
        }
    }

    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), AdminGuard)
    async deleteUser(@Param('id') id: number) {
        try {
            await this.userService.deleteUser(id);
            return new SuccessResponse();
        } catch (error) {
            return new ErrorResponse(error.message);
        }
    }

    @Get('self')
    @ApiBearerAuth()
    @UseGuards(AuthGuard())
    getSelf(@CurrentUser() myself: User) {
        return new SuccessResponse(myself);
    }

    @Get(':id')
    async getByID(@Param('id') id: number) {
        try {
            const user = await this.userService.findByID(id);
            return new SuccessResponse(user);
        } catch (error) {
            return new ErrorResponse(error.message);
        }
    }

    @Post('signin')
    @UsePipes(new ValidationPipe(UserController.signInSchema))
    async signin(@Body() {email, password}: SignInOptionsDto) {
        try {
            const user: User = await this.userService.findOneByEmail(email);
            if (bcrypt.compareSync(password, user.password) && user.isVerified) {
                delete user.password;
                const token = this.jwtService.sign({
                    id: user.id,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    lastName: user.lastName,
                    firstName: user.firstName,
                });
                return new SuccessResponse({token});
            } else {
                return new ErrorResponse('INCORRECT_PASSWORD');
            }
        } catch (error) {
            return new ErrorResponse('USER_NOT_FOUND');
        }
    }

    @Post('forgot-password')
    async forgotPassword(@Body() {email}: ForgotPasswordDto) {
        try {
            const user: User = await this.userService.findOneByEmail(email);
            const token = this.jwtService.sign({id: user.id, date: new Date()});
            await this.emailService.sendPasswordRecoveryEmail(user, token);
            return new SuccessResponse();
        } catch (error) {
            return new ErrorResponse('USER_NOT_FOUND');
        }
    }

    @Post('update-password')
    @ApiBearerAuth()
    @UseGuards(AuthGuard())
    async changePassword(@Body() passwords: UpdatePasswordDto, @CurrentUser() user: User) {
        try {
            await this.userService.updatePassword(passwords.currentPassword, passwords.newPassword, user.id);
            return new SuccessResponse();
        } catch (error) {
            return new ErrorResponse(error.message);
        }
    }

    @Post('update-profile-pic')
    @ApiBearerAuth()
    @UseGuards(AuthGuard())
    @UseInterceptors(FileInterceptor('file'))
    async updateProfilePic(@CurrentUser() user: User, @UploadedFile() file: FileModel) {
        try {
            const updatedUser = await this.userService.updateProfilePic(file.filename, user);
            return new SuccessResponse(updatedUser);
        } catch (error) {
            return new ErrorResponse(error.message);
        }
    }

    @Get('profile-pic/:imgName')
    async getProfilePic(@Param('imgName') imgName: string, @Res() res: Response) {
        res.sendFile(imgName, {root: 'public'});
    }
}
