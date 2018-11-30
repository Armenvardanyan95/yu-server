import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification, NotificationType } from '../entities/notification.entity';
import { OrderStatus } from '../entities/order.entity';

@Injectable()
export class NotificationsService {

    constructor(@InjectRepository(Notification) private readonly notificationsRepository: Repository<Notification>) {}

    async getNotificationsByUserID(id: number) {
        return await this.notificationsRepository.find({where: {owner: {id}}});
    }

    async create(notificationData) {
        const notification = this.notificationsRepository.create(notificationData);
        return await this.notificationsRepository.save(notification);
    }

    mapOrderStatusToNotificationType(status: OrderStatus): NotificationType {
        switch (status) {
            case OrderStatus.Review:
                return NotificationType.OrderUnderReview;
            case OrderStatus.Approved:
                return NotificationType.OrderApproved;
        }
    }

}