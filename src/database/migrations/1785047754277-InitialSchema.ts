import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1785047754277 implements MigrationInterface {
  name = 'InitialSchema1785047754277';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum
    await queryRunner.query(`
      CREATE TYPE "public"."users_role_enum" AS ENUM('producer', 'viewer')
    `);

    // Users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'viewer',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email")
    `);

    // Movies table
    await queryRunner.query(`
      CREATE TABLE "movies" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" text NOT NULL,
        "ticketPrice" numeric(10,2) NOT NULL,
        "posterUrl" character varying,
        "isPublished" boolean NOT NULL DEFAULT false,
        "producerId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_c5b2c134e871bfd1c2fe7cc3705" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_51bbdeed4e5a122f359e63b4d2" ON "movies" ("isPublished")
    `);

    // Purchases table
    await queryRunner.query(`
      CREATE TABLE "purchases" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "viewerId" uuid NOT NULL,
        "movieId" uuid NOT NULL,
        "amountPaid" numeric(10,2) NOT NULL,
        "transactionReference" character varying NOT NULL,
        "purchaseDate" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_a1f9aad4ee571e9ebdfe5515ff3" UNIQUE ("transactionReference"),
        CONSTRAINT "UQ_f07732dd072ae8b7b57b878d1fe" UNIQUE ("viewerId", "movieId"),
        CONSTRAINT "PK_1d55032f37a34c6eceacbbca6b8" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_09f2622ce9f5edeaf44763266d" ON "purchases" ("viewerId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_8fe28d4d46ab9e73f5696000be" ON "purchases" ("movieId")
    `);

    // Foreign keys
    await queryRunner.query(`
      ALTER TABLE "movies"
      ADD CONSTRAINT "FK_7814dbf533c62f55013b2b2c150"
      FOREIGN KEY ("producerId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "purchases"
      ADD CONSTRAINT "FK_09f2622ce9f5edeaf44763266db"
      FOREIGN KEY ("viewerId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "purchases"
      ADD CONSTRAINT "FK_8fe28d4d46ab9e73f5696000bec"
      FOREIGN KEY ("movieId") REFERENCES "movies"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "purchases" DROP CONSTRAINT "FK_8fe28d4d46ab9e73f5696000bec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchases" DROP CONSTRAINT "FK_09f2622ce9f5edeaf44763266db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" DROP CONSTRAINT "FK_7814dbf533c62f55013b2b2c150"`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."IDX_8fe28d4d46ab9e73f5696000be"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_09f2622ce9f5edeaf44763266d"`,
    );
    await queryRunner.query(`DROP TABLE "purchases"`);

    await queryRunner.query(
      `DROP INDEX "public"."IDX_51bbdeed4e5a122f359e63b4d2"`,
    );
    await queryRunner.query(`DROP TABLE "movies"`);

    await queryRunner.query(
      `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);

    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
