import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ default: true })
    isActive: boolean;

    @Column()
    test: string;

    @Column()
    test2: string;
}
