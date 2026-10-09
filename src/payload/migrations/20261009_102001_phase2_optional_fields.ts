import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services" ALTER COLUMN "duration_min" DROP NOT NULL;
  ALTER TABLE "services" ALTER COLUMN "price" DROP NOT NULL;`);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services" ALTER COLUMN "duration_min" SET NOT NULL;
  ALTER TABLE "services" ALTER COLUMN "price" SET NOT NULL;`);
}
