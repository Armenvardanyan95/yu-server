import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { MessageModel } from './message.model';

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
        @InjectRepository(Message) private readonly messageRepository: Repository<Message>,
    ) {}

    async initiateChat(data) {
        const chat = this.chatRepository.create(data);
        await this.chatRepository.save(chat);
        const message = this.messageRepository.create({content: data.content, chat: chat as any});
        return await this.messageRepository.save(message);
    }

    async getUserChats(user: User) {
        const where = user.isAdmin ? {assignee: user.id} : {client: user.id};
        return await this.chatRepository.find({where, relations: ['client', 'assignee']});
    }

    async addMessage(message: MessageModel) {
        const msg = this.messageRepository.create(message as any);
        return await this.messageRepository.save(msg);
    }

    async getMessagesFromChat(id: number, page: number) {
        const startAt = page - 1;
        return await this.messageRepository.find({
            where: {chat: {id}},
            relations: ['author'],
            order: {createdAt: 'ASC'},
            // skip: startAt * 50,
            // take: page,
        });
    }

    async markAsRead(id: number) {
        const message = await this.messageRepository.findOneOrFail({where: {id}, relations: ['chat']});
        message.isRead = true;
        return await this.messageRepository.save(message);
    }
}