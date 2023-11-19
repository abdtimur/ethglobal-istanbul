import { MigrationInterface, QueryRunner } from 'typeorm';

export class Multichain1700357748464 implements MigrationInterface {
  name = 'Multichain1700357748464';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "timeslot" DROP CONSTRAINT "FK_a2fe52504cd7e9e0a02edcaabba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timeslot" ADD "chainId" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "mentor" ADD "chainId" integer NOT NULL DEFAULT '11155111'`,
    );
    await queryRunner.query(
      `ALTER TABLE "mentor" DROP CONSTRAINT "PK_6c627300bf17eeb277f3ff52f5f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mentor" ADD CONSTRAINT "PK_7b454f66ceee920c9e61018b4df" PRIMARY KEY ("account", "chainId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "timeslot" ADD CONSTRAINT "FK_69fa357d2e63a4825f50d319f66" FOREIGN KEY ("mentorAccount", "chainId") REFERENCES "mentor"("account","chainId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "timeslot" DROP CONSTRAINT "FK_69fa357d2e63a4825f50d319f66"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mentor" DROP CONSTRAINT "PK_7b454f66ceee920c9e61018b4df"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mentor" ADD CONSTRAINT "PK_6c627300bf17eeb277f3ff52f5f" PRIMARY KEY ("account")`,
    );
    await queryRunner.query(`ALTER TABLE "mentor" DROP COLUMN "chainId"`);
    await queryRunner.query(`ALTER TABLE "timeslot" DROP COLUMN "chainId"`);
    await queryRunner.query(
      `ALTER TABLE "timeslot" ADD CONSTRAINT "FK_a2fe52504cd7e9e0a02edcaabba" FOREIGN KEY ("mentorAccount") REFERENCES "mentor"("account") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
