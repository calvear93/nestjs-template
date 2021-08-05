import { AfterLoad, BeforeInsert, BeforeUpdate, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity, ITrackable } from 'database/common';
import { SampleType } from './sample-types.enum';

/**
 * Sample entity.
 *
 * @see: https://orkhan.gitbook.io/typeorm/docs/entities
 *
 * @export
 * @class SampleEntity
 * @extends {BaseEntity<SampleEntity>}
 * @implements {ITrackable}
 */
@Entity()
export class SampleEntity
    extends BaseEntity<SampleEntity>
    implements ITrackable
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
    @Index()
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
        this.searchName = this.name.toLowerCase().normalize('NFD').replace(/[\p{Diacritic}|\u0027]/gu, '');
    }
}
