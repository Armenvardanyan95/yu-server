import {
    Controller, Post, Body, Get, Param, UseGuards, UsePipes, Delete, FileInterceptor, UploadedFile,
    UseInterceptors, Res, Response,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { join } from 'path';

import { UserService } from './user.service';
import { ISignInOptions, IUser } from '../../infrastructure/interfaces';
import { ErrorResponse, SuccessResponse } from '../../infrastructure/responses';
import { Schema, Validations } from '../../infrastructure/schemas';
import { ValidationPipe } from '../../infrastructure/pipes';
import { User } from '../../entities/user.entity';
import { AdminGuard } from '../../infrastructure/guards';
import { CurrentUser } from '../../infrastructure/decorators';
import { EmailService } from '../../common/services/email.service';

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
    async createUser(@Body() userData: IUser) {
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
    @UseGuards(AuthGuard())
    async updateUser(@Body() userData: IUser, @CurrentUser() user) {
        try {
            const updatedUser: User = await this.userService.updateUser(userData, user.id);
            return new SuccessResponse(updatedUser);
        } catch (error) {
            return new ErrorResponse(error.message);
        }
    }

    @Post('/verify')
    async verifyUser(@Body() {token}: {token: string}) {
        const payload = this.jwtService.decode(token, {complete: true, json: true});
        const id = payload['payload']['id'];
        try {
            await this.userService.verify(id);
            return new SuccessResponse();
        } catch (error) {
            return new ErrorResponse(error.message);
        }
    }

    @Get()
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
    async signin(@Body() {email, password}: ISignInOptions) {
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
    async forgotPassword(@Body() {email}: {email: string}) {
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
    @UseGuards(AuthGuard())
    async changePassword(@Body() passwords, @CurrentUser() user) {
        try {
            await this.userService.updatePassword(passwords.currentPassword, passwords.newPassword, user.id);
            return new SuccessResponse(null);
        } catch (error) {
            return new ErrorResponse(error.message);
        }
    }

    @Post('update-profile-pic')
    @UseGuards(AuthGuard())
    @UseInterceptors(FileInterceptor('file'))
    async updateProfilePic(@CurrentUser() user, @UploadedFile() file) {
        try {
            const updatedUser = await this.userService.updateProfilePic(file.filename, user);
            return new SuccessResponse(updatedUser);
        } catch (error) {
            return new ErrorResponse(error.message);
        }
    }

    @Get('profile-pic/:imgName')
    async getProfilePic(@Param('imgName') imgName, @Res() res) {
        res.sendFile(imgName, {root: 'public'});
    }
}
