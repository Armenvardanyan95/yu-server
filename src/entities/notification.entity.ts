import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { User } from './user.entity';

export enum NotificationType {
    OrderUnderReview = 'OrderUnderReview',
    OrderApproved = 'OrderApproved',
}

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    content: string;

    @Column()
    createdAt: Date = new Date();

    @Column()
    isRead: boolean = false;

    @Column({nullable: true})
    image: string;

    @ManyToOne(type => User)
    owner: User;

    @Column('enum', {enum: NotificationType})
    type: NotificationType;
}