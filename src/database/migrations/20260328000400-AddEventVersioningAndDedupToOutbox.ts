import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEventVersioningAndDedupToOutbox20260328000400 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "outbox_events"
            ADD COLUMN "event_id" character varying(120)
        `);
        await queryRunner.query(`
            UPDATE "outbox_events"
            SET "event_id" = "id"
            WHERE "event_id" IS NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "outbox_events"
            ALTER COLUMN "event_id" SET NOT NULL
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_outbox_events_event_id"
            ON "outbox_events" ("event_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "outbox_events"
            ADD COLUMN "schema_version" integer NOT NULL DEFAULT 1
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "outbox_events"
            DROP COLUMN "schema_version"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."UQ_outbox_events_event_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "outbox_events"
            DROP COLUMN "event_id"
        `);
    }
}

