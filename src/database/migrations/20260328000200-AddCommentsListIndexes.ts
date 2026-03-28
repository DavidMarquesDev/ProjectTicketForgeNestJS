import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommentsListIndexes20260328000200 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX "IDX_comments_ticket_id_created_at" ON "comments" ("ticket_id", "created_at")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_comments_ticket_id_created_at"
        `);
    }
}
