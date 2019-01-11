import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Order } from './order.entity';
import { Notification } from './notification.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    password: string;

    @Column({unique: true})
    email: string;

    @Column({nullable: true})
    bio: string;

    @Column()
    isAdmin: boolean = false;

    @Column({nullable: true})
    phoneNumber: string;

    @Column({nullable: true})
    profilePic: string = '';

    @Column()
    isVerified: boolean = false;

    @Column({nullable: true})
    isOnline: boolean = false;

    @OneToMany(type => Order, order => order.owner)
    orders: Order[];

    @OneToMany(type => Notification, notification => notification.owner)
    notifications: Notification[];

    @BeforeInsert()
    encrypt(): void {
        this.password = bcrypt.hashSync(this.password, 10);
    }
}