import { NotificationType } from '../entities/notification.entity';
import { Order } from '../entities/order.entity';
import { User } from '../entities/user.entity';
import { Not } from 'typeorm';

export class NotificationModel {
    constructor(
        public title: string,
        public content: string,
        public type: NotificationType,
        public owner: User,
        image?: string,
    ) {}

    private static create(
        title: string,
        content: string,
        type: NotificationType,
        owner: User,
        image: string = null,
    ): NotificationModel {
        return new NotificationModel(title, content, type, owner, image);
    }

    static createOrderUnderReviewNotification(order: Order): NotificationModel {
        return NotificationModel.create('GOT_ORDER_UNDER_REVIEW', order.title,
            NotificationType.OrderUnderReview, order.owner);
    }

    static createOrderApprovedNotification(order: Order): NotificationModel {
        return NotificationModel.create('GOT_ORDER_APPROVED', order.title,
            NotificationType.OrderApproved, order.owner);
    }

    static fromType(type: NotificationType, order): NotificationModel {
        switch (type) {
            case NotificationType.OrderUnderReview:
                return NotificationModel.createOrderUnderReviewNotification(order);
            case NotificationType.OrderApproved:
                return NotificationModel.createOrderApprovedNotification(order);
        }
    }
}