import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTracingAndAuditTrail20260328000700 implements MigrationInterface {
    name = 'AddTracingAndAuditTrail20260328000700';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "outbox_events"
            ADD "trace_id" character varying(120)
        `);
        await queryRunner.query(`
            CREATE TABLE "audit_logs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "action" character varying(120) NOT NULL,
                "aggregate_type" character varying(80) NOT NULL,
                "aggregate_id" character varying(80) NOT NULL,
                "actor_id" integer,
                "trace_id" character varying(120),
                "metadata" text NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_audit_logs_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_audit_logs_action_created_at"
            ON "audit_logs" ("action", "created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_audit_logs_aggregate_created_at"
            ON "audit_logs" ("aggregate_type", "aggregate_id", "created_at")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_audit_logs_aggregate_created_at"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_audit_logs_action_created_at"
        `);
        await queryRunner.query(`
            DROP TABLE "audit_logs"
        `);
        await queryRunner.query(`
            ALTER TABLE "outbox_events"
            DROP COLUMN "trace_id"
        `);
    }
}
