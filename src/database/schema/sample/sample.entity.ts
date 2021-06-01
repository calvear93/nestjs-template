import { Column, Entity, PrimaryGeneratedColumn, AfterLoad, BeforeInsert, BeforeUpdate } from 'typeorm';
import { ITrackable, Trackable } from '../../common';

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

    @Column()
    searchName: string;

    @AfterLoad()
    @BeforeInsert()
    @BeforeUpdate()
    normalizeName(): void
    {
        this.searchName = this.name.toLowerCase();
    }
}
