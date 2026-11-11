import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_hero_layout" AS ENUM('overlay', 'split', 'centered');
  CREATE TYPE "public"."enum_pages_blocks_quote_style" AS ENUM('serif', 'script');
  CREATE TYPE "public"."enum_pages_blocks_text_image_heading_style" AS ENUM('serif', 'script');
  CREATE TYPE "public"."enum_pages_blocks_text_image_image_shape" AS ENUM('bleed', 'arch', 'framed');
  CREATE TYPE "public"."enum_pages_blocks_text_image_tone" AS ENUM('ivory', 'soft');
  CREATE TYPE "public"."enum_pages_blocks_principles_items_icon" AS ENUM('sun', 'lotus', 'leaf', 'heart', 'compass', 'waves', 'infinity', 'prayer', 'book', 'chat', 'home', 'laptop', 'calendar', 'users', 'mail', 'alert', 'pulse');
  CREATE TYPE "public"."enum_pages_blocks_principles_variant" AS ENUM('columns', 'cards');
  CREATE TYPE "public"."enum_pages_blocks_principles_tone" AS ENUM('ivory', 'soft');
  CREATE TYPE "public"."enum_pages_blocks_cta_variant" AS ENUM('light', 'olive');
  CREATE TYPE "public"."enum_pages_blocks_notice_icon" AS ENUM('sun', 'lotus', 'leaf', 'heart', 'compass', 'waves', 'infinity', 'prayer', 'book', 'chat', 'home', 'laptop', 'calendar', 'users', 'mail', 'alert', 'pulse');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_layout" AS ENUM('overlay', 'split', 'centered');
  CREATE TYPE "public"."enum__pages_v_blocks_quote_style" AS ENUM('serif', 'script');
  CREATE TYPE "public"."enum__pages_v_blocks_text_image_heading_style" AS ENUM('serif', 'script');
  CREATE TYPE "public"."enum__pages_v_blocks_text_image_image_shape" AS ENUM('bleed', 'arch', 'framed');
  CREATE TYPE "public"."enum__pages_v_blocks_text_image_tone" AS ENUM('ivory', 'soft');
  CREATE TYPE "public"."enum__pages_v_blocks_principles_items_icon" AS ENUM('sun', 'lotus', 'leaf', 'heart', 'compass', 'waves', 'infinity', 'prayer', 'book', 'chat', 'home', 'laptop', 'calendar', 'users', 'mail', 'alert', 'pulse');
  CREATE TYPE "public"."enum__pages_v_blocks_principles_variant" AS ENUM('columns', 'cards');
  CREATE TYPE "public"."enum__pages_v_blocks_principles_tone" AS ENUM('ivory', 'soft');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_variant" AS ENUM('light', 'olive');
  CREATE TYPE "public"."enum__pages_v_blocks_notice_icon" AS ENUM('sun', 'lotus', 'leaf', 'heart', 'compass', 'waves', 'infinity', 'prayer', 'book', 'chat', 'home', 'laptop', 'calendar', 'users', 'mail', 'alert', 'pulse');
  CREATE TABLE "pages_blocks_notice" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_notice_icon",
  	"link_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_notice_locales" (
  	"heading" varchar,
  	"body" varchar,
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_notice" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_notice_icon",
  	"link_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_notice_locales" (
  	"heading" varchar,
  	"body" varchar,
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "layout" "enum_pages_blocks_hero_layout" DEFAULT 'split';
  ALTER TABLE "pages_blocks_hero_locales" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages_blocks_quote" ADD COLUMN "style" "enum_pages_blocks_quote_style" DEFAULT 'serif';
  ALTER TABLE "pages_blocks_text_image" ADD COLUMN "heading_style" "enum_pages_blocks_text_image_heading_style" DEFAULT 'serif';
  ALTER TABLE "pages_blocks_text_image" ADD COLUMN "image_shape" "enum_pages_blocks_text_image_image_shape" DEFAULT 'bleed';
  ALTER TABLE "pages_blocks_text_image" ADD COLUMN "tone" "enum_pages_blocks_text_image_tone" DEFAULT 'ivory';
  ALTER TABLE "pages_blocks_text_image_locales" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages_blocks_text_image_locales" ADD COLUMN "script" varchar;
  ALTER TABLE "pages_blocks_text_image_locales" ADD COLUMN "highlight" varchar;
  ALTER TABLE "pages_blocks_text_image_locales" ADD COLUMN "aside_note" varchar;
  ALTER TABLE "pages_blocks_principles_items" ADD COLUMN "icon" "enum_pages_blocks_principles_items_icon";
  ALTER TABLE "pages_blocks_principles" ADD COLUMN "variant" "enum_pages_blocks_principles_variant" DEFAULT 'columns';
  ALTER TABLE "pages_blocks_principles" ADD COLUMN "numbered" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_principles" ADD COLUMN "tone" "enum_pages_blocks_principles_tone" DEFAULT 'ivory';
  ALTER TABLE "pages_blocks_principles_locales" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages_blocks_principles_locales" ADD COLUMN "script" varchar;
  ALTER TABLE "pages_blocks_principles_locales" ADD COLUMN "closing" varchar;
  ALTER TABLE "pages_blocks_services_preview_locales" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages_blocks_services_preview_locales" ADD COLUMN "script" varchar;
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "variant" "enum_pages_blocks_cta_variant" DEFAULT 'light';
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "secondary_cta_href" varchar;
  ALTER TABLE "pages_blocks_cta_locales" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages_blocks_cta_locales" ADD COLUMN "secondary_cta_label" varchar;
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "layout" "enum__pages_v_blocks_hero_layout" DEFAULT 'split';
  ALTER TABLE "_pages_v_blocks_hero_locales" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_quote" ADD COLUMN "style" "enum__pages_v_blocks_quote_style" DEFAULT 'serif';
  ALTER TABLE "_pages_v_blocks_text_image" ADD COLUMN "heading_style" "enum__pages_v_blocks_text_image_heading_style" DEFAULT 'serif';
  ALTER TABLE "_pages_v_blocks_text_image" ADD COLUMN "image_shape" "enum__pages_v_blocks_text_image_image_shape" DEFAULT 'bleed';
  ALTER TABLE "_pages_v_blocks_text_image" ADD COLUMN "tone" "enum__pages_v_blocks_text_image_tone" DEFAULT 'ivory';
  ALTER TABLE "_pages_v_blocks_text_image_locales" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_text_image_locales" ADD COLUMN "script" varchar;
  ALTER TABLE "_pages_v_blocks_text_image_locales" ADD COLUMN "highlight" varchar;
  ALTER TABLE "_pages_v_blocks_text_image_locales" ADD COLUMN "aside_note" varchar;
  ALTER TABLE "_pages_v_blocks_principles_items" ADD COLUMN "icon" "enum__pages_v_blocks_principles_items_icon";
  ALTER TABLE "_pages_v_blocks_principles" ADD COLUMN "variant" "enum__pages_v_blocks_principles_variant" DEFAULT 'columns';
  ALTER TABLE "_pages_v_blocks_principles" ADD COLUMN "numbered" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_principles" ADD COLUMN "tone" "enum__pages_v_blocks_principles_tone" DEFAULT 'ivory';
  ALTER TABLE "_pages_v_blocks_principles_locales" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_principles_locales" ADD COLUMN "script" varchar;
  ALTER TABLE "_pages_v_blocks_principles_locales" ADD COLUMN "closing" varchar;
  ALTER TABLE "_pages_v_blocks_services_preview_locales" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_services_preview_locales" ADD COLUMN "script" varchar;
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "variant" "enum__pages_v_blocks_cta_variant" DEFAULT 'light';
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "secondary_cta_href" varchar;
  ALTER TABLE "_pages_v_blocks_cta_locales" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_cta_locales" ADD COLUMN "secondary_cta_label" varchar;
  ALTER TABLE "pages_blocks_notice" ADD CONSTRAINT "pages_blocks_notice_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_notice_locales" ADD CONSTRAINT "pages_blocks_notice_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_notice"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_notice" ADD CONSTRAINT "_pages_v_blocks_notice_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_notice_locales" ADD CONSTRAINT "_pages_v_blocks_notice_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_notice"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_notice_order_idx" ON "pages_blocks_notice" USING btree ("_order");
  CREATE INDEX "pages_blocks_notice_parent_id_idx" ON "pages_blocks_notice" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_notice_path_idx" ON "pages_blocks_notice" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_notice_locales_locale_parent_id_unique" ON "pages_blocks_notice_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_notice_locales_parent_id_idx" ON "pages_blocks_notice_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_notice_order_idx" ON "_pages_v_blocks_notice" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_notice_parent_id_idx" ON "_pages_v_blocks_notice" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_notice_path_idx" ON "_pages_v_blocks_notice" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_notice_locales_locale_parent_id_unique" ON "_pages_v_blocks_notice_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_notice_locales_parent_id_idx" ON "_pages_v_blocks_notice_locales" USING btree ("_parent_id");`);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_notice" CASCADE;
  DROP TABLE "pages_blocks_notice_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_notice" CASCADE;
  DROP TABLE "_pages_v_blocks_notice_locales" CASCADE;
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "layout";
  ALTER TABLE "pages_blocks_hero_locales" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_quote" DROP COLUMN "style";
  ALTER TABLE "pages_blocks_text_image" DROP COLUMN "heading_style";
  ALTER TABLE "pages_blocks_text_image" DROP COLUMN "image_shape";
  ALTER TABLE "pages_blocks_text_image" DROP COLUMN "tone";
  ALTER TABLE "pages_blocks_text_image_locales" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_text_image_locales" DROP COLUMN "script";
  ALTER TABLE "pages_blocks_text_image_locales" DROP COLUMN "highlight";
  ALTER TABLE "pages_blocks_text_image_locales" DROP COLUMN "aside_note";
  ALTER TABLE "pages_blocks_principles_items" DROP COLUMN "icon";
  ALTER TABLE "pages_blocks_principles" DROP COLUMN "variant";
  ALTER TABLE "pages_blocks_principles" DROP COLUMN "numbered";
  ALTER TABLE "pages_blocks_principles" DROP COLUMN "tone";
  ALTER TABLE "pages_blocks_principles_locales" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_principles_locales" DROP COLUMN "script";
  ALTER TABLE "pages_blocks_principles_locales" DROP COLUMN "closing";
  ALTER TABLE "pages_blocks_services_preview_locales" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_services_preview_locales" DROP COLUMN "script";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "variant";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "secondary_cta_href";
  ALTER TABLE "pages_blocks_cta_locales" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_cta_locales" DROP COLUMN "secondary_cta_label";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "layout";
  ALTER TABLE "_pages_v_blocks_hero_locales" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_quote" DROP COLUMN "style";
  ALTER TABLE "_pages_v_blocks_text_image" DROP COLUMN "heading_style";
  ALTER TABLE "_pages_v_blocks_text_image" DROP COLUMN "image_shape";
  ALTER TABLE "_pages_v_blocks_text_image" DROP COLUMN "tone";
  ALTER TABLE "_pages_v_blocks_text_image_locales" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_text_image_locales" DROP COLUMN "script";
  ALTER TABLE "_pages_v_blocks_text_image_locales" DROP COLUMN "highlight";
  ALTER TABLE "_pages_v_blocks_text_image_locales" DROP COLUMN "aside_note";
  ALTER TABLE "_pages_v_blocks_principles_items" DROP COLUMN "icon";
  ALTER TABLE "_pages_v_blocks_principles" DROP COLUMN "variant";
  ALTER TABLE "_pages_v_blocks_principles" DROP COLUMN "numbered";
  ALTER TABLE "_pages_v_blocks_principles" DROP COLUMN "tone";
  ALTER TABLE "_pages_v_blocks_principles_locales" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_principles_locales" DROP COLUMN "script";
  ALTER TABLE "_pages_v_blocks_principles_locales" DROP COLUMN "closing";
  ALTER TABLE "_pages_v_blocks_services_preview_locales" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_services_preview_locales" DROP COLUMN "script";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "variant";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "secondary_cta_href";
  ALTER TABLE "_pages_v_blocks_cta_locales" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_cta_locales" DROP COLUMN "secondary_cta_label";
  DROP TYPE "public"."enum_pages_blocks_hero_layout";
  DROP TYPE "public"."enum_pages_blocks_quote_style";
  DROP TYPE "public"."enum_pages_blocks_text_image_heading_style";
  DROP TYPE "public"."enum_pages_blocks_text_image_image_shape";
  DROP TYPE "public"."enum_pages_blocks_text_image_tone";
  DROP TYPE "public"."enum_pages_blocks_principles_items_icon";
  DROP TYPE "public"."enum_pages_blocks_principles_variant";
  DROP TYPE "public"."enum_pages_blocks_principles_tone";
  DROP TYPE "public"."enum_pages_blocks_cta_variant";
  DROP TYPE "public"."enum_pages_blocks_notice_icon";
  DROP TYPE "public"."enum__pages_v_blocks_hero_layout";
  DROP TYPE "public"."enum__pages_v_blocks_quote_style";
  DROP TYPE "public"."enum__pages_v_blocks_text_image_heading_style";
  DROP TYPE "public"."enum__pages_v_blocks_text_image_image_shape";
  DROP TYPE "public"."enum__pages_v_blocks_text_image_tone";
  DROP TYPE "public"."enum__pages_v_blocks_principles_items_icon";
  DROP TYPE "public"."enum__pages_v_blocks_principles_variant";
  DROP TYPE "public"."enum__pages_v_blocks_principles_tone";
  DROP TYPE "public"."enum__pages_v_blocks_cta_variant";
  DROP TYPE "public"."enum__pages_v_blocks_notice_icon";`);
}
