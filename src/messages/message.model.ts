import { User } from '../entities/user.entity';
import { Chat } from '../entities/chat.entity';

export class MessageModel {
    constructor(
        public chat: number & Chat,
        public content: string,
        public author: User,
        public image?: string,
    ) {}
}