import { Body, Controller, Delete, Get, Param, Post, UseGuards, UsePipes, UseInterceptors, FileInterceptor, UploadedFile } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { OrderService } from './order.service';
import { User } from '../entities/user.entity';
import { IOrder } from '../infrastructure/interfaces';
import { Schema, Validations } from '../infrastructure/schemas';
import { CurrentUser } from '../infrastructure/decorators';
import { ValidationPipe } from '../infrastructure/pipes';
import { AdminGuard } from '../infrastructure/guards';
import { ErrorResponse, SuccessResponse } from '../infrastructure/responses';

@Controller('order')
export class OrderController {

    private static orderCreateSchema: Schema = new Schema([
        ['title', [Validations.Required]],
        ['description', [Validations.Required]],
    ]);

    constructor(private readonly orderService: OrderService) {}

    @Post()
    @UsePipes(new ValidationPipe(OrderController.orderCreateSchema, [User]))
    @UseGuards(AuthGuard(), AdminGuard)
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
}
