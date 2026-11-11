import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_bookings_locale" AS ENUM('en', 'de');
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'notifyBookingCancelled';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'notifyBookingCancelled';
  ALTER TABLE "bookings" ADD COLUMN "locale" "enum_bookings_locale" DEFAULT 'en' NOT NULL;
  ALTER TABLE "bookings" ADD COLUMN "owner_notified_at" timestamp(3) with time zone;
  ALTER TABLE "bookings" ADD COLUMN "cancellation_sent_at" timestamp(3) with time zone;
  ALTER TABLE "booking_settings" ADD COLUMN "client_change_notice_hours" numeric DEFAULT 0 NOT NULL;`);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'processBookingSideEffects', 'removeBookingCalendarEvent');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'processBookingSideEffects', 'removeBookingCalendarEvent');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  ALTER TABLE "bookings" DROP COLUMN "locale";
  ALTER TABLE "bookings" DROP COLUMN "owner_notified_at";
  ALTER TABLE "bookings" DROP COLUMN "cancellation_sent_at";
  ALTER TABLE "booking_settings" DROP COLUMN "client_change_notice_hours";
  DROP TYPE "public"."enum_bookings_locale";`);
}
