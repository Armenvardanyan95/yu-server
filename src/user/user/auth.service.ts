import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from './user.service';
import { IJwtPayload } from '../../infrastructure/interfaces';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UserService,
        private readonly jwtService: JwtService,
    ) {}

    async signIn(em: string): Promise<string> {
        const users = await this.usersService.findByEmail(em);
        const {id, email, firstName, lastName} = users[0];
        return this.jwtService.sign({id, email, firstName, lastName});
    }

    async validateUser(payload: IJwtPayload): Promise<any> {
        return this.usersService.findByEmail(payload.email);
    }
}
