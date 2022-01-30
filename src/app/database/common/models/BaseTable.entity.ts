import { Column } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ITrackable, Trackable } from './Trackable.fragment';

/**
 * Entity base class.
 *
 * @class BaseTable
 * @implements {ITrackable}
 * @template T
 */
export abstract class BaseTable<T> implements ITrackable {
    /**
     * Creates an instance of T.
     *
     * @param {Partial<T>} [init] partial object
     */
    constructor(init?: Partial<T>) {
        init && Object.assign(this, init);
    }

    /**
     * System tracking info.
     *
     * @type {Trackable}
     */
    @Column(() => Trackable)
    @Exclude()
    system!: Trackable;
}
