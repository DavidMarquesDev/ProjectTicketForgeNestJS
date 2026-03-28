import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIdempotencyKeysTable20260328000300 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "idempotency_keys" (
                "id" SERIAL NOT NULL,
                "scope" character varying(120) NOT NULL,
                "actor_id" integer NOT NULL,
                "idempotency_key" character varying(120) NOT NULL,
                "response_payload" text NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_idempotency_keys_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_idempotency_scope_actor_key" UNIQUE ("scope", "actor_id", "idempotency_key")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_idempotency_scope_actor_key"
            ON "idempotency_keys" ("scope", "actor_id", "idempotency_key")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_idempotency_scope_actor_key"
        `);
        await queryRunner.query(`
            DROP TABLE "idempotency_keys"
        `);
    }
}

