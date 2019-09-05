import {
    Body, Controller, Delete, Get, Param, Post, UseGuards, UsePipes, UseInterceptors, FileInterceptor,
    UploadedFile, Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { OrderService } from './order.service';
import { User } from '../entities/user.entity';
import { IOrder } from '../infrastructure/dto';
import { Schema, Validations } from '../infrastructure/schemas';
import { CurrentUser } from '../infrastructure/decorators';
import { ValidationPipe } from '../infrastructure/pipes';
import { ErrorResponse, SuccessResponse } from '../infrastructure/responses';
import { Order, OrderStatus } from '../entities/order.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationModel } from '../notifications/notification.model';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Controller('order')
export class OrderController {

    private static orderCreateSchema: Schema = new Schema([
        ['title', [Validations.Required]],
        ['description', [Validations.Required]],
    ]);

    constructor(
        private readonly orderService: OrderService,
        private readonly notificationsService: NotificationsService,
        private readonly notificationsGateway: NotificationsGateway,
    ) {}

    @Post()
    @UsePipes(new ValidationPipe(OrderController.orderCreateSchema, [User]))
    @UseGuards(AuthGuard())
    @UseInterceptors(FileInterceptor('file'))
    async createOrder(@Body() orderData: IOrder, @CurrentUser() user: User, @UploadedFile() file) {
        try {
            const order = await this.orderService.createOrder(orderData, user, file);
            return new SuccessResponse(order);
        } catch (error) {
            return  new ErrorResponse(error.message);
        }
    }

    @Delete(':id')
    @UseGuards(AuthGuard())
    async deleteOrder(@Param('id') id: number, @CurrentUser() user: User) {
        try {
            const order = await this.orderService.findOrderByID(id);
            if (order.owner.id === user.id || user.isAdmin) {
                await this.orderService.deleteOrder(id);
                return new SuccessResponse(null);
            } else {
                return new ErrorResponse('You have no permission to delete this order');
            }
        } catch (error) {
            return new ErrorResponse(error.message);
        }
    }

    @Get()
    @UseGuards(AuthGuard())
    async userOrders(@CurrentUser() user: User) {
        try {
            const orders = await this.orderService.findOrdersByUserID(user.id);
            return new SuccessResponse(orders);
        } catch (error) {
            return new ErrorResponse(error.message);
        }
    }

    @Get('uploaded-doc/:docName')
    async getAttachment(@Param('docName') docName, @Res() res) {
        res.sendFile(docName, {root: 'public'});
    }

    @Post('change-status')
    @UseGuards(AuthGuard())
    async changeOrderStatus(@Body() {id, status}: {id: number, status: OrderStatus}) {
        try {
            const order: Order = await this.orderService.changeStatus(id, status);
            const notification = await this.notificationsService.create(
                NotificationModel.fromType(this.notificationsService.mapOrderStatusToNotificationType(status), order),
            );
            this.notificationsGateway.addNotification(order.owner.id, notification);
            return new SuccessResponse();
        } catch (error) {
            return new ErrorResponse(error.message);
        }
    }
}
