import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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

    async deleteUser(id: number): Promise<any> {
        return await this.userRepository.delete({id});
    }
}
