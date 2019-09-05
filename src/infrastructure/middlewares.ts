import { NestMiddleware, Injectable, MiddlewareFunction } from '@nestjs/common';

@Injectable()
export class WebSocketRequestHandlerMiddleware implements NestMiddleware {
    resolve(...args: any[]): MiddlewareFunction {
        return (req, res, next) => {
            next();
        };
    }
}