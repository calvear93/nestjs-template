import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

/**
 * Common trackable info for entities.
 *
 * @see: https://orkhan.gitbook.io/typeorm/docs/entities#column-types-for-postgres
 *
 * @export
 * @class Trackable
 */
export class Trackable
{
    /**
     * Creation date.
     *
     * @type {Date}
     */
    @CreateDateColumn({ type: 'time with time zone' })
    createdDate: Date;

    @UpdateDateColumn({ type: 'time with time zone' })
    updatedDate: Date;

    @DeleteDateColumn({ type: 'time with time zone' })
    deletedDate: Date;

    @VersionColumn()
    version: number;
}

/**
 * Trackable interface.
 *
 * @export
 * @interface ITrackable
 */
export interface ITrackable {
    trackInfo: Trackable;
}
