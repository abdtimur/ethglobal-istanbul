import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1700250681767 implements MigrationInterface {
  name = 'Initial1700250681767';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."timeslot_status_enum" AS ENUM('Free', 'Booked', 'Completed', 'Canceled', 'Expired')`,
    );
    await queryRunner.query(
      `CREATE TABLE "timeslot" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."timeslot_status_enum" NOT NULL DEFAULT 'Free', "date" character(10) NOT NULL, "time" character(5) NOT NULL, "price" character varying NOT NULL, "currency" character varying NOT NULL, "duration" integer NOT NULL, "account" character varying, "txHash" character varying, "txCompletedHash" character varying, "txValue" numeric(78,0), "callInfo" character varying, "mentorAccount" character varying NOT NULL, CONSTRAINT "PK_cd8bca557ee1eb5b090b9e63009" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "mentor" ("account" character varying NOT NULL, "displayName" character varying, "profilePhotoUrl" character varying, "tlsnVerified" boolean NOT NULL DEFAULT false, "humanVerified" boolean NOT NULL DEFAULT false, "polygonIdVerified" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6c627300bf17eeb277f3ff52f5f" PRIMARY KEY ("account"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "timeslot" ADD CONSTRAINT "FK_a2fe52504cd7e9e0a02edcaabba" FOREIGN KEY ("mentorAccount") REFERENCES "mentor"("account") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "timeslot" DROP CONSTRAINT "FK_a2fe52504cd7e9e0a02edcaabba"`,
    );
    await queryRunner.query(`DROP TABLE "mentor"`);
    await queryRunner.query(`DROP TABLE "timeslot"`);
    await queryRunner.query(`DROP TYPE "public"."timeslot_status_enum"`);
  }
}
