import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_cta_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_image_position" AS ENUM('left', 'right');
  ALTER TABLE "pages_blocks_hero_locales" ADD COLUMN "tagline" varchar;
  ALTER TABLE "pages_blocks_quote" ADD COLUMN "background_image_id" integer;
  ALTER TABLE "pages_blocks_text_image" ADD COLUMN "cta_href" varchar;
  ALTER TABLE "pages_blocks_text_image_locales" ADD COLUMN "cta_label" varchar;
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "image_position" "enum_pages_blocks_cta_image_position" DEFAULT 'right';
  ALTER TABLE "_pages_v_blocks_hero_locales" ADD COLUMN "tagline" varchar;
  ALTER TABLE "_pages_v_blocks_quote" ADD COLUMN "background_image_id" integer;
  ALTER TABLE "_pages_v_blocks_text_image" ADD COLUMN "cta_href" varchar;
  ALTER TABLE "_pages_v_blocks_text_image_locales" ADD COLUMN "cta_label" varchar;
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "image_position" "enum__pages_v_blocks_cta_image_position" DEFAULT 'right';
  ALTER TABLE "pages_blocks_quote" ADD CONSTRAINT "pages_blocks_quote_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_quote" ADD CONSTRAINT "_pages_v_blocks_quote_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_quote_background_image_idx" ON "pages_blocks_quote" USING btree ("background_image_id");
  CREATE INDEX "_pages_v_blocks_quote_background_image_idx" ON "_pages_v_blocks_quote" USING btree ("background_image_id");`);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_quote" DROP CONSTRAINT "pages_blocks_quote_background_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_quote" DROP CONSTRAINT "_pages_v_blocks_quote_background_image_id_media_id_fk";
  
  DROP INDEX "pages_blocks_quote_background_image_idx";
  DROP INDEX "_pages_v_blocks_quote_background_image_idx";
  ALTER TABLE "pages_blocks_hero_locales" DROP COLUMN "tagline";
  ALTER TABLE "pages_blocks_quote" DROP COLUMN "background_image_id";
  ALTER TABLE "pages_blocks_text_image" DROP COLUMN "cta_href";
  ALTER TABLE "pages_blocks_text_image_locales" DROP COLUMN "cta_label";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "image_position";
  ALTER TABLE "_pages_v_blocks_hero_locales" DROP COLUMN "tagline";
  ALTER TABLE "_pages_v_blocks_quote" DROP COLUMN "background_image_id";
  ALTER TABLE "_pages_v_blocks_text_image" DROP COLUMN "cta_href";
  ALTER TABLE "_pages_v_blocks_text_image_locales" DROP COLUMN "cta_label";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "image_position";
  DROP TYPE "public"."enum_pages_blocks_cta_image_position";
  DROP TYPE "public"."enum__pages_v_blocks_cta_image_position";`);
}
