import { MigrationInterface, QueryRunner } from 'typeorm';

export class SampleMigration1628355748483 implements MigrationInterface {
    name = 'SampleMigration1628355748483';

    public async up(queryRunner: QueryRunner): Promise<void> {
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
                "systemIsdisabled" boolean NOT NULL DEFAULT false,
                CONSTRAINT "PK_e873152a04c344da778041e482c" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_2843c8c525dfddadcfc6cf70b8" ON "public"."sample_entity" ("name")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_2843c8c525dfddadcfc6cf70b8"
        `);
        await queryRunner.query(`
            DROP TABLE "public"."sample_entity"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."sample_entity_type_enum"
        `);
    }
}
