import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminGuard implements CanActivate {

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user[0];
        // TODO: understand why is this an array
        return user.isAdmin;
    }

}

@Injectable()
export class WsAuthGuard implements CanActivate {

    constructor(private readonly jwtService: JwtService) {}

    canActivate(context: ExecutionContext): boolean {
        const {token} = context.switchToWs().getData();
        return !!this.jwtService.verify(token);
    }

}