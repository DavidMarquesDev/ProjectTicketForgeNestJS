import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOutboxEventsTable20260327000300 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
        `);

        await queryRunner.query(`
            CREATE TABLE "outbox_events" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "event_name" character varying(120) NOT NULL,
                "aggregate_type" character varying(80) NOT NULL,
                "aggregate_id" character varying(80) NOT NULL,
                "payload" text NOT NULL,
                "status" character varying NOT NULL DEFAULT 'pending',
                "attempts" integer NOT NULL DEFAULT 0,
                "available_at" TIMESTAMP NOT NULL DEFAULT now(),
                "queued_at" TIMESTAMP NULL,
                "processed_at" TIMESTAMP NULL,
                "last_error" text NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_outbox_events_id" PRIMARY KEY ("id"),
                CONSTRAINT "CHK_outbox_events_status" CHECK ("status" IN ('pending', 'queued', 'processed', 'failed'))
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_outbox_events_status_available_at"
            ON "outbox_events" ("status", "available_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_outbox_events_event_name_created_at"
            ON "outbox_events" ("event_name", "created_at")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_outbox_events_event_name_created_at"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_outbox_events_status_available_at"
        `);
        await queryRunner.query(`
            DROP TABLE "outbox_events"
        `);
    }
}
