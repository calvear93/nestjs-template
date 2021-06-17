import { Column, CreateDateColumn, DeleteDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

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
    @CreateDateColumn()
    createdDate?: Date;

    /**
     * Updating date.
     *
     * @type {Date}
     */
    @UpdateDateColumn()
    updatedDate?: Date;

    /**
     * Soft deletion date.
     *
     * @type {Date}
     */
    @DeleteDateColumn()
    deletedDate?: Date;

    /**
     * Entity version.
     *
     * @type {number}
     */
    @VersionColumn()
    version?: number;

    /**
     * Whether entity is active.
     *
     * @type {boolean}
     */
    @Column({ default: true })
    isActive: boolean;
}

/**
 * Trackable interface.
 *
 * @export
 * @interface ITrackable
 */
export interface ITrackable {
    system: Trackable;
}
