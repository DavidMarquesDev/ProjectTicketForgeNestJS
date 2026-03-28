import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeadLetteringToOutbox20260328000500 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "outbox_events"
            ADD COLUMN "dead_lettered_at" TIMESTAMP NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "outbox_events"
            DROP CONSTRAINT "CHK_outbox_events_status"
        `);

        await queryRunner.query(`
            ALTER TABLE "outbox_events"
            ADD CONSTRAINT "CHK_outbox_events_status"
            CHECK ("status" IN ('pending', 'queued', 'processed', 'failed', 'dead_lettered'))
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "outbox_events"
            DROP CONSTRAINT "CHK_outbox_events_status"
        `);

        await queryRunner.query(`
            ALTER TABLE "outbox_events"
            ADD CONSTRAINT "CHK_outbox_events_status"
            CHECK ("status" IN ('pending', 'queued', 'processed', 'failed'))
        `);

        await queryRunner.query(`
            ALTER TABLE "outbox_events"
            DROP COLUMN "dead_lettered_at"
        `);
    }
}

