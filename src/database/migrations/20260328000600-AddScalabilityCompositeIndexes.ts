import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScalabilityCompositeIndexes20260328000600 implements MigrationInterface {
    name = 'AddScalabilityCompositeIndexes20260328000600';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX "IDX_tickets_assigned_to_created_at"
            ON "tickets" ("assigned_to", "created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_outbox_events_status_available_at_created_at"
            ON "outbox_events" ("status", "available_at", "created_at")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_outbox_events_status_available_at_created_at"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_tickets_assigned_to_created_at"
        `);
    }
}
