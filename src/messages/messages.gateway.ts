import { WebSocketGateway, SubscribeMessage, WebSocketServer } from '@nestjs/websockets';
import { Injectable, UseGuards, UsePipes } from '@nestjs/common';

import { WsTransformPipe } from '../infrastructure/pipes';
import { WsAuthGuard as AuthGuard } from '../infrastructure/guards';
import { IUser } from '../infrastructure/interfaces';
import { Message } from '../entities/message.entity';
import { UserService } from '../user/user/user.service';

enum MessageType {
    NewMessage = 1,
    MarkedAsRead = 2,
    Typing = 3,
}

@WebSocketGateway()
@UsePipes(WsTransformPipe)
@UseGuards(AuthGuard)
@Injectable()
export class MessagesGateway {

    @WebSocketServer() server;

    constructor(private readonly userService: UserService) {}

    addMessage(message: Message) {
        this.server.emit('chats_' + message.chat, {type: MessageType.NewMessage, data: message});
    }

    markAsRead(message: Message) {
        this.server.emit('chats_' + message.chat.id, {type: MessageType.MarkedAsRead, data: message.id});
    }

    @SubscribeMessage('typing')
    async emitTyping(client, {user, data}: {user: IUser, data: {chatID}}) {
        this.server.emit('chats_' + data.chatID, {type: MessageType.Typing, data: {userID: user.id}});
    }

    @SubscribeMessage('connectToChat')
    async connectToChat(client, {data}: {user: IUser, data: {chatID: number}}) {
        client.join('chats_' + data.chatID);
    }

    @SubscribeMessage('toggle-online')
    async toggleOnline(client, {user, data}: {user: IUser, data: {status: boolean}}) {
        await this.userService.setOnlineStatus(data.status, user.id);
    }

}