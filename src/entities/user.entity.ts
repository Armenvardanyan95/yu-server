import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Order } from './order.entity';

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

    @Column()
    isAdmin: boolean = false;

    @OneToMany(type => Order, order => order.owner)
    orders: Order[];

    @BeforeInsert()
    encrypt(): void {
        this.password = bcrypt.hashSync(this.password, 10);
    }
}