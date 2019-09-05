import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order, OrderStatus } from '../entities/order.entity';
import { User } from '../entities/user.entity';
import { IOrder } from '../infrastructure/dto';

@Injectable()
export class OrderService {
    constructor(@InjectRepository(Order) private readonly orderRepository: Repository<Order>) {}

    async createOrder(orderData: IOrder, user: User, file = null): Promise<Order> {
        const order = this.orderRepository.create(orderData);
        order.owner = user;
        order.filePath = file.filename;
        return await this.orderRepository.save(order);
    }

    async deleteOrder(id: number) {
        return await this.orderRepository.delete({id});
    }

    async findOrderByID(id: number) {
        return await this.orderRepository.findOneOrFail({id}, {relations: ['owner']});
    }

    async findOrdersByUserID(id: number) {
        return await this.orderRepository.find({where: {owner: {id}}});
    }

    async changeStatus(id: number, status: OrderStatus) {
        const order: Order = await this.orderRepository.findOneOrFail({where: {id}, relations: ['owner']});
        order.status = status;
        await this.orderRepository.save(order);
        return order;
    }
}
