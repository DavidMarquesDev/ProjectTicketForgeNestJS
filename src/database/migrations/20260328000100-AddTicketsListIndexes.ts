import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTicketsListIndexes20260328000100 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX "IDX_tickets_created_at" ON "tickets" ("created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_tickets_status_created_at" ON "tickets" ("status", "created_at")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_tickets_status_created_at"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_tickets_created_at"
        `);
    }
}
