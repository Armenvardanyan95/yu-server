import { UseGuards, UsePipes } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, WebSocketServer } from '@nestjs/websockets';

import { WsTransformPipe } from '../infrastructure/pipes';
import { WsAuthGuard as AuthGuard } from '../infrastructure/guards';
import { UserModelDto } from '../infrastructure/dto';
import { NotificationsService } from './notifications.service';

@WebSocketGateway()
@UsePipes(WsTransformPipe)
@UseGuards(AuthGuard)
export class NotificationsGateway {

    @WebSocketServer() server;

    constructor(private readonly notificationsService: NotificationsService) {}

    addNotification(userID: number, notification) {
        this.server.emit('notifications_' + userID, notification);
    }

    @SubscribeMessage('getNotifications')
    async getNotifications(client, {user}: {user: UserModelDto}) {
        try {
            client.join('notifications_' + user.id);
            const notifications = await this.notificationsService.getNotificationsByUserID(user.id);
            return {event: 'onNotifications', data: notifications};
        } catch (error) {
            return null;
        }
    }

    @SubscribeMessage('deleteNotification')
    async deleteNotification(client, {user, data}: {user: UserModelDto, data: {id: number}}) {
        try {
            await this.notificationsService.delete(data.id);
            const notifications = await this.notificationsService.getNotificationsByUserID(user.id);
            return {event: 'onNotifications', data: notifications};
        } catch (error) {
            return null;
        }
    }

    @SubscribeMessage('markAsRead')
    async markAsRead(client, {user, data}: {user: UserModelDto, data: {id: number}}) {
        try {
            await this.notificationsService.markAsRead(data.id);
            const notifications = await this.notificationsService.getNotificationsByUserID(user.id);
            return {event: 'onNotifications', data: notifications};
        } catch (error) {
            return null;
        }
    }
}