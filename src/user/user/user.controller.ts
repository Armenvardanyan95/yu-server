import { Controller, Post, Body, Get, Param, UseGuards, UsePipes, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {  } from 'typeorm';

import { UserService } from './user.service';
import { ISignInOptions, IUser } from '../../infrastructure/interfaces';
import { ErrorResponse, SuccessResponse } from '../../infrastructure/responses';
import { Schema, Validations } from '../../infrastructure/schemas';
import { ValidationPipe } from '../../infrastructure/pipes';
import { User } from '../../entities/user.entity';
import { AdminGuard } from '../../infrastructure/guards';

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
    ) {}

    @Post()
    @UsePipes(new ValidationPipe(UserController.signUpSchema))
    async createUser(@Body() userData: IUser) {
        if (userData.password !== userData.confirmPassword) {
            return new ErrorResponse('Passwords do not match');
        } else if (await this.userService.isExistingUser(userData.email)) {
            return new ErrorResponse('User already exists');
        } else {
            try {
                const createdUser = this.userService.createUser(userData);
                return new SuccessResponse(createdUser);
            } catch (error) {
                return new ErrorResponse(error.message);
            }
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
            return new SuccessResponse(null);
        } catch (error) {
            return new ErrorResponse(error.message);
        }
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
            if (bcrypt.compareSync(password, user.password)) {
                delete user.password;
                const token = this.jwtService.sign({id: user.id, email: user.email, isAdmin: user.isAdmin});
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
            return new SuccessResponse(null);
        } catch (error) {
            return new ErrorResponse('USER_NOT_FOUND');
        }
    }
}
