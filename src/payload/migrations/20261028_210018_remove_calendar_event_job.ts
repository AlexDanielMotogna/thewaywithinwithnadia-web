import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'removeBookingCalendarEvent';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'removeBookingCalendarEvent';
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_locales_parent_id_idx" ON "pages_blocks_hero_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_quote_locales_parent_id_idx" ON "pages_blocks_quote_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_text_image_locales_parent_id_idx" ON "pages_blocks_text_image_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_principles_items_locales_parent_id_idx" ON "pages_blocks_principles_items_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_principles_locales_parent_id_idx" ON "pages_blocks_principles_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_services_preview_locales_parent_id_idx" ON "pages_blocks_services_preview_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_locales_parent_id_idx" ON "pages_blocks_cta_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_locales_parent_id_idx" ON "pages_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_locales_parent_id_idx" ON "_pages_v_blocks_hero_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_quote_locales_parent_id_idx" ON "_pages_v_blocks_quote_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_text_image_locales_parent_id_idx" ON "_pages_v_blocks_text_image_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_principles_items_locales_parent_id_idx" ON "_pages_v_blocks_principles_items_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_principles_locales_parent_id_idx" ON "_pages_v_blocks_principles_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_services_preview_locales_parent_id_idx" ON "_pages_v_blocks_services_preview_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_locales_parent_id_idx" ON "_pages_v_blocks_cta_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_locales_parent_id_idx" ON "_pages_v_locales" USING btree ("_parent_id");
  CREATE INDEX "services_locales_parent_id_idx" ON "services_locales" USING btree ("_parent_id");
  CREATE INDEX "site_settings_locales_parent_id_idx" ON "site_settings_locales" USING btree ("_parent_id");
  CREATE INDEX "navigation_items_locales_parent_id_idx" ON "navigation_items_locales" USING btree ("_parent_id");`);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'processBookingSideEffects');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'processBookingSideEffects');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "media_locales_parent_id_idx";
  DROP INDEX "pages_blocks_hero_locales_parent_id_idx";
  DROP INDEX "pages_blocks_quote_locales_parent_id_idx";
  DROP INDEX "pages_blocks_text_image_locales_parent_id_idx";
  DROP INDEX "pages_blocks_principles_items_locales_parent_id_idx";
  DROP INDEX "pages_blocks_principles_locales_parent_id_idx";
  DROP INDEX "pages_blocks_services_preview_locales_parent_id_idx";
  DROP INDEX "pages_blocks_cta_locales_parent_id_idx";
  DROP INDEX "pages_locales_parent_id_idx";
  DROP INDEX "_pages_v_blocks_hero_locales_parent_id_idx";
  DROP INDEX "_pages_v_blocks_quote_locales_parent_id_idx";
  DROP INDEX "_pages_v_blocks_text_image_locales_parent_id_idx";
  DROP INDEX "_pages_v_blocks_principles_items_locales_parent_id_idx";
  DROP INDEX "_pages_v_blocks_principles_locales_parent_id_idx";
  DROP INDEX "_pages_v_blocks_services_preview_locales_parent_id_idx";
  DROP INDEX "_pages_v_blocks_cta_locales_parent_id_idx";
  DROP INDEX "_pages_v_locales_parent_id_idx";
  DROP INDEX "services_locales_parent_id_idx";
  DROP INDEX "site_settings_locales_parent_id_idx";
  DROP INDEX "navigation_items_locales_parent_id_idx";`);
}
