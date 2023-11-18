import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssertionLink1700339059984 implements MigrationInterface {
  name = 'AssertionLink1700339059984';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "timeslot" ADD "assertionLink" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "timeslot" DROP COLUMN "assertionLink"`,
    );
  }
}
