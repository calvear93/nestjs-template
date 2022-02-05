import { Test, TestingModule } from '@nestjs/testing';
import { SampleEntity, SampleEntityRepository } from 'app/database/default';
import { SampleORMService } from '../services/sample-orm.service';
import { SampleORMController } from './sample-orm.controller';

describe('SampleORMController', () => {
    // controller instance
    let controller: SampleORMController;

    // name of the entity for create
    const entityName = 'SampleName';

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SampleORMController],
            providers: [
                SampleORMService,
                {
                    provide: SampleEntityRepository,
                    useClass: SampleEntityRepositoryMock
                }
            ]
        }).compile();

        controller = module.get<SampleORMController>(SampleORMController);
    });

    test('should be defined', () => {
        expect(controller).toBeDefined();
    });

    test('entity should be created', () => {
        expect(controller.create(entityName)).toBeDefined();
    });

    test(`entity with name ${entityName} should exists`, async () => {
        const entity = await controller.getByName(entityName.toUpperCase());

        expect(entity?.name).toBe(entityName);
    });
});

/**
 * Mock repository.
 *
 * @class SampleEntityRepositoryMock
 */
export class SampleEntityRepositoryMock {
    /**
     * Simulates database autoincremental id.
     *
     * @static
     */
    static autoincremental = 0;

    /**
     * Simulates database.
     *
     * @static
     * @type {Record<number, SampleEntity>}
     */
    static mockDatabase: Record<number, SampleEntity> = {};

    /**
     * Search for an entity by it's name.
     *
     * @param {string} searchedName searched name
     * @returns {Promise<SampleEntity | undefined>} entity
     */
    findByName(searchedName: string): Promise<SampleEntity | undefined> {
        const entity = Object.values(
            SampleEntityRepositoryMock.mockDatabase
        ).find((e) => e.searchName === searchedName.toLowerCase());

        return Promise.resolve(entity);
    }

    /**
     * Saves a new entity to mocked database.
     *
     * @param {SampleEntity} entity entity for save
     * @returns {Promise<SampleEntity>} entity
     */
    save(entity: SampleEntity): Promise<SampleEntity> {
        entity.id = ++SampleEntityRepositoryMock.autoincremental;
        entity.normalizeName();
        SampleEntityRepositoryMock.mockDatabase[entity.id] = entity;

        return Promise.resolve(entity);
    }
}