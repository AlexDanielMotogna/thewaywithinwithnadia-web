import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_calendar_connection_status" AS ENUM('not_connected', 'connected', 'needs_reconnect');
  CREATE TABLE "calendar_connection" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_calendar_connection_status" DEFAULT 'not_connected' NOT NULL,
  	"connected_email" varchar,
  	"connected_at" timestamp(3) with time zone,
  	"calendar_id" varchar DEFAULT 'primary' NOT NULL,
  	"refresh_token_sealed" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  `);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "calendar_connection" CASCADE;
  DROP TYPE "public"."enum_calendar_connection_status";`);
}
