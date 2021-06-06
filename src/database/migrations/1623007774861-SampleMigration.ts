import { MigrationInterface, QueryRunner } from 'typeorm';

export class SampleMigration1623007774861 implements MigrationInterface
{
    name = 'SampleMigration1623007774861'

    public async up(queryRunner: QueryRunner): Promise<void>
    {
        await queryRunner.query(`
            CREATE TYPE "public"."sample_entity_type_enum" AS ENUM('admin', 'support', 'user')
        `);
        await queryRunner.query(`
            CREATE TABLE "public"."sample_entity" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "type" "public"."sample_entity_type_enum" NOT NULL DEFAULT 'user',
                "isActive" boolean NOT NULL DEFAULT true,
                "searchName" character varying NOT NULL,
                "systemCreateddate" TIMESTAMP NOT NULL DEFAULT now(),
                "systemUpdateddate" TIMESTAMP NOT NULL DEFAULT now(),
                "systemDeleteddate" TIMESTAMP,
                "systemVersion" integer NOT NULL,
                CONSTRAINT "PK_9c38c07f6112068c233987a5cec" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void>
    {
        await queryRunner.query(`
            DROP TABLE "public"."sample_entity"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."sample_entity_type_enum"
        `);
    }
}
