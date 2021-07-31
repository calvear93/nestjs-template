import { Column } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ITrackable, Trackable } from './trackable.fragment';

/**
 * Entity base class.
 *
 * @export
 * @class BaseEntity
 * @implements {ITrackable}
 * @template T
 */
export class BaseEntity<T> implements ITrackable
{
    /**
     * Creates an instance of T.
     *
     * @param {Partial<T>} [init] partial object
     */
    constructor(init?: Partial<T>)
    {
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
