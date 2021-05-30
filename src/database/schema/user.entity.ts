import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ITrackable, Trackable } from '../common';

@Entity()
export class SampleEntity implements ITrackable
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ default: true })
    isActive: boolean;

    @Column(() => Trackable)
    trackInfo: Trackable;
}
