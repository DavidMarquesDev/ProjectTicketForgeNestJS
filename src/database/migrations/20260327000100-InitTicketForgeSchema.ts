import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitTicketForgeSchema20260327000100 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL,
                "email" character varying(150) NOT NULL,
                "password_hash" character varying(255) NOT NULL,
                "role" character varying NOT NULL DEFAULT 'user',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_users_email" UNIQUE ("email"),
                CONSTRAINT "CHK_users_role" CHECK ("role" IN ('admin', 'support', 'user'))
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "tickets" (
                "id" SERIAL NOT NULL,
                "title" character varying(200) NOT NULL,
                "description" text NOT NULL,
                "status" character varying NOT NULL DEFAULT 'open',
                "created_by" integer NOT NULL,
                "assigned_to" integer,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_tickets_id" PRIMARY KEY ("id"),
                CONSTRAINT "CHK_tickets_status" CHECK ("status" IN ('open', 'in_progress', 'resolved', 'closed'))
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "comments" (
                "id" SERIAL NOT NULL,
                "ticket_id" integer NOT NULL,
                "author_id" integer NOT NULL,
                "content" text NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_comments_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_tickets_created_by" ON "tickets" ("created_by")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_tickets_assigned_to" ON "tickets" ("assigned_to")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_tickets_status" ON "tickets" ("status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_comments_ticket_id" ON "comments" ("ticket_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_comments_author_id" ON "comments" ("author_id")
        `);

        await queryRunner.query(`
            ALTER TABLE "tickets"
            ADD CONSTRAINT "FK_tickets_created_by_users_id"
            FOREIGN KEY ("created_by") REFERENCES "users"("id")
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "tickets"
            ADD CONSTRAINT "FK_tickets_assigned_to_users_id"
            FOREIGN KEY ("assigned_to") REFERENCES "users"("id")
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "comments"
            ADD CONSTRAINT "FK_comments_ticket_id_tickets_id"
            FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "comments"
            ADD CONSTRAINT "FK_comments_author_id_users_id"
            FOREIGN KEY ("author_id") REFERENCES "users"("id")
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_author_id_users_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_ticket_id_tickets_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "tickets" DROP CONSTRAINT "FK_tickets_assigned_to_users_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "tickets" DROP CONSTRAINT "FK_tickets_created_by_users_id"
        `);

        await queryRunner.query(`
            DROP INDEX "public"."IDX_comments_author_id"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_comments_ticket_id"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_tickets_status"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_tickets_assigned_to"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_tickets_created_by"
        `);

        await queryRunner.query(`
            DROP TABLE "comments"
        `);
        await queryRunner.query(`
            DROP TABLE "tickets"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
    }
}
