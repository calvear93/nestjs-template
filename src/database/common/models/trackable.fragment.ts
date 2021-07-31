import { Column, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Common trackable info for entities.
 *
 * @see: https://orkhan.gitbook.io/typeorm/docs/entities#column-types-for-mssql
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
    createdDate: Date;

    /**
     * Updating date.
     *
     * @type {Date}
     */
    @UpdateDateColumn()
    updatedDate: Date;

    /**
     * Soft deletion date.
     *
     * @type {Date}
     */
    @DeleteDateColumn({ nullable: true })
    deletedDate?: Date;

    /**
     * Whether entity is disabled.
     *
     * @type {boolean}
     */
    @Column({ default: false })
    isDisabled: boolean;
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
