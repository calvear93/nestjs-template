import { MigrationInterface, QueryRunner } from 'typeorm';

export class SampleMigration1622506005229 implements MigrationInterface
{
    name = 'SampleMigration1622506005229'

    public async up(queryRunner: QueryRunner): Promise<void>
    {
        await queryRunner.query(`
            CREATE TABLE "public"."sample_entity" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "isActive" boolean NOT NULL DEFAULT true,
                "searchName" character varying NOT NULL,
                "trackInfoCreateddate" TIMESTAMP NOT NULL DEFAULT now(),
                "trackInfoUpdateddate" TIMESTAMP NOT NULL DEFAULT now(),
                "trackInfoDeleteddate" TIMESTAMP,
                "trackInfoVersion" integer NOT NULL,
                CONSTRAINT "PK_9c38c07f6112068c233987a5cec" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void>
    {
        await queryRunner.query(`
            DROP TABLE "public"."sample_entity"
        `);
    }
}
