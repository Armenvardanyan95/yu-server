import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../../entities/user.entity';
import { IUser } from '../../infrastructure/interfaces';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

    async findAll(): Promise<User[]> {
        return await this.userRepository.find();
    }

    async findByID(id: number): Promise<User> {
        return await this.userRepository.findOneOrFail({where: {id}});
    }

    public async findByEmail(email: string): Promise<User[]> {
        return await this.userRepository.find({
            where: {email},
        });
    }

    public async findOneByEmail(email: string): Promise<User> {
        return await this.userRepository.findOneOrFail({where: {email}});
    }

    async isExistingUser(email: string): Promise<boolean> {
        const matchingUsers: User[] = await this.findByEmail(email);
        return matchingUsers.length !== 0;
    }

    async createUser(userData: IUser): Promise<User> {
        const createdUser = this.userRepository.create(userData);
        return await this.userRepository.save(createdUser);
    }

    async updateUser(userData: IUser = {} as IUser, userID): Promise<User> {
        const user: User = await this.findByID(userID);
        user.lastName = userData.lastName || user.lastName;
        user.firstName = userData.firstName || user.firstName;
        user.bio = userData.bio || user.bio;
        user.phoneNumber = userData.phoneNumber || user.phoneNumber;
        return await this.userRepository.save(user);
    }

    async updatePassword(currentPassword, newPassword, userID) {
        try {
            const user = await this.userRepository.findOneOrFail({where: {id: userID}});
            if (!bcrypt.compareSync(currentPassword, user.password)) {
                throw new HttpException('INCORRECT_PASSWORD', HttpStatus.UNPROCESSABLE_ENTITY);
            } else {
                user.password = bcrypt.hashSync(newPassword, 10);
                return await this.userRepository.save(user);
            }
        } catch (error) {
            throw new HttpException('Password not correct', HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }

    async deleteUser(id: number): Promise<any> {
        return await this.userRepository.delete({id});
    }

    async updateProfilePic(path: string, user: User) {
        user.profilePic = path;
        return await this.userRepository.save(user);
    }

    async verify(id) {
        const user = await this.userRepository.findOneOrFail({where: {id}});
        user.isVerified = true;
        return await this.userRepository.save(user);
    }

    async setOnlineStatus(status: boolean, id: number) {
        const user = await this.userRepository.findOneOrFail({where: {id}});
        user.isOnline = status;
        return await this.userRepository.save(user);
    }
}
