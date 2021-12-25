import {
    AfterLoad,
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    Index,
    PrimaryGeneratedColumn
} from 'typeorm';
import { BaseTable, ITrackable } from 'database/common';
import { SampleEntityType } from './SampleEntityType.enum';

/**
 * Sample entity.
 *
 * @see: https://orkhan.gitbook.io/typeorm/docs/entities
 * @class SampleEntity
 * @augments {BaseEntity<SampleEntity>}
 * @implements {ITrackable}
 */
@Entity()
export class SampleEntity
    extends BaseTable<SampleEntity>
    implements ITrackable
{
    /**
     * Primary key.
     * Autoincremental.
     *
     * @type {number}
     */
    @PrimaryGeneratedColumn()
    id!: number;

    /**
     * Entity name.
     *
     * @type {string}
     */
    @Index({ unique: true })
    @Column()
    name: string;

    /**
     * Sample entity type.
     *
     * @type {SampleType}
     */
    @Column({
        type: 'enum',
        enum: SampleEntityType,
        default: SampleEntityType.USER
    })
    type: SampleEntityType;

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
    normalizeName(): void {
        this.searchName = this.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\p{Diacritic}|\u0027]/gu, '');
    }
}
