import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNameAndCpfToUsers20260327000200 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" ADD COLUMN "name" character varying(150)
        `);

        await queryRunner.query(`
            ALTER TABLE "users" ADD COLUMN "cpf" character varying(11)
        `);

        await queryRunner.query(`
            ALTER TABLE "users" ADD CONSTRAINT "UQ_users_cpf" UNIQUE ("cpf")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "UQ_users_cpf"
        `);

        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "cpf"
        `);

        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "name"
        `);
    }
}
