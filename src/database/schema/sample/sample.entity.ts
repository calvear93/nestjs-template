import { Column, Entity, PrimaryGeneratedColumn, AfterLoad, BeforeInsert, BeforeUpdate } from 'typeorm';
import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { ITrackable, Trackable } from '../../common';
import { SampleType } from './sample-types.enum';

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
     * Sample entity type.
     *
     * @type {SampleType}
     */
    @Column({
        type: 'enum',
        enum: SampleType,
        default: SampleType.USER
    })
    type: SampleType;

    /**
     * Entity tracking info like creation date.
     *
     * @type {Trackable}
     */
    @ApiHideProperty()
    @Exclude()
    @Column(() => Trackable)
    system: Trackable;

    /**
     * Normalized entity name.
     * Calculated column from name.
     *
     * @type {string}
     */
    @Column()
    searchName: string;

    /**
     * Partial initializer constructor.
     *
     * @param {Partial<SampleEntity>} [init] partial initializer
     */
    constructor(init?: Partial<SampleEntity>)
    {
        init && Object.assign(this, init);
    }

    /**
     * Normalizes entity's name.
     */
    @AfterLoad()
    @BeforeInsert()
    @BeforeUpdate()
    normalizeName(): void
    {
        this.searchName = this.name.toLowerCase().normalize('NFD').replace(/[\p{Diacritic}|\u0027]/gu, '');
    }
}
