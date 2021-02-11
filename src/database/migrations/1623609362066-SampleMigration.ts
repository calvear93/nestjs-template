import { MigrationInterface, QueryRunner } from 'typeorm';

export class SampleMigration1623609362066 implements MigrationInterface
{
    name = 'SampleMigration1623609362066'

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
                "searchName" character varying NOT NULL,
                "systemCreateddate" TIMESTAMP NOT NULL DEFAULT now(),
                "systemUpdateddate" TIMESTAMP NOT NULL DEFAULT now(),
                "systemDeleteddate" TIMESTAMP,
                "systemVersion" integer NOT NULL,
                "systemIsactive" boolean NOT NULL DEFAULT true,
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
