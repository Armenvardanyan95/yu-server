import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { Chat } from './chat.entity';
import { User } from './user.entity';

export enum Sender {
    Client = 1,
    Assignee = 2,
}

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @ManyToOne(type => Chat)
    chat: Chat;

    @Column()
    isRead: boolean = false;

    @Column({nullable: true})
    image: string;

    @ManyToOne(type => User)
    author: User;

    @Column()
    createdAt: Date = new Date();
}