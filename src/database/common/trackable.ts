import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

export class Trackable
{
    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn()
    updatedDate: Date;

    @DeleteDateColumn()
    deletedDate: Date;

    @VersionColumn()
    version: number;
}

export interface ITrackable {
    trackInfo: Trackable;
}
