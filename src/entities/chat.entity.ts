import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { User } from './user.entity';

@Entity()
export class Chat {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User)
    client: User;

    @ManyToOne(type => User)
    assignee: User;

}