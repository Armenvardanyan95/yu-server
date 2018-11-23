import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { User } from './user.entity';

enum OrderTypes {
    Translation = 'Translation',
    Inspection = 'Inspection',
    Creation = 'Creation',
}

@Entity()
export class Order {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column('enum', {enum: OrderTypes})
    type: OrderTypes;

    @Column({nullable: true})
    filePath: string = null;

    @ManyToOne(type => User)
    owner: User;

}