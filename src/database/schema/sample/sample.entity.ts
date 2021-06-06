import { Column, Entity, PrimaryGeneratedColumn, AfterLoad, BeforeInsert, BeforeUpdate } from 'typeorm';
import { ITrackable, Trackable } from '../../common';

/**
 * Sample entity.
 *
 * @see: https://orkhan.gitbook.io/typeorm/docs/entities
 *
 * @export
 * @class SampleEntity
 * @implements {ITrackable}
 */
@Entity()
export class SampleEntity implements ITrackable
{
    /**
     * Primary key.
     * Autoincremental.
     *
     * @type {number}
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Entity name.
     *
     * @type {string}
     */
    @Column()
    name: string;

    /**
     * Whether entity is active.
     *
     * @type {boolean}
     */
    @Column({ default: true })
    isActive: boolean;

    /**
     * Entity tracking info like creation date.
     *
     * @type {Trackable}
     */
    @Column(() => Trackable)
    trackInfo: Trackable;

    /**
     * Normalized entity name.
     * Calculated column from name.
     *
     * @type {string}
     */
    @Column()
    searchName: string;

    /**
     * Normalizes entity's name.
     */
    @AfterLoad()
    @BeforeInsert()
    @BeforeUpdate()
    normalizeName(): void
    {
        this.searchName = this.name.toLowerCase();
    }
}
