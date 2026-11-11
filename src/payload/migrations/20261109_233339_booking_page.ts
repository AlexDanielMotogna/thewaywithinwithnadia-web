import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_booking_page_what_to_expect_icon" AS ENUM('leaf', 'sun', 'heart', 'lotus');
  CREATE TABLE "booking_page_what_to_expect" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_booking_page_what_to_expect_icon" DEFAULT 'leaf' NOT NULL
  );
  
  CREATE TABLE "booking_page_what_to_expect_locales" (
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "booking_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"before_you_book_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "booking_page_locales" (
  	"before_you_book_title" varchar,
  	"before_you_book_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "services_locales" ADD COLUMN "tagline" varchar;
  ALTER TABLE "booking_page_what_to_expect" ADD CONSTRAINT "booking_page_what_to_expect_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."booking_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "booking_page_what_to_expect_locales" ADD CONSTRAINT "booking_page_what_to_expect_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."booking_page_what_to_expect"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "booking_page" ADD CONSTRAINT "booking_page_before_you_book_image_id_media_id_fk" FOREIGN KEY ("before_you_book_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "booking_page_locales" ADD CONSTRAINT "booking_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."booking_page"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "booking_page_what_to_expect_order_idx" ON "booking_page_what_to_expect" USING btree ("_order");
  CREATE INDEX "booking_page_what_to_expect_parent_id_idx" ON "booking_page_what_to_expect" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "booking_page_what_to_expect_locales_locale_parent_id_unique" ON "booking_page_what_to_expect_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "booking_page_what_to_expect_locales_parent_id_idx" ON "booking_page_what_to_expect_locales" USING btree ("_parent_id");
  CREATE INDEX "booking_page_before_you_book_before_you_book_image_idx" ON "booking_page" USING btree ("before_you_book_image_id");
  CREATE UNIQUE INDEX "booking_page_locales_locale_parent_id_unique" ON "booking_page_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "booking_page_locales_parent_id_idx" ON "booking_page_locales" USING btree ("_parent_id");`);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "booking_page_what_to_expect" CASCADE;
  DROP TABLE "booking_page_what_to_expect_locales" CASCADE;
  DROP TABLE "booking_page" CASCADE;
  DROP TABLE "booking_page_locales" CASCADE;
  ALTER TABLE "services_locales" DROP COLUMN "tagline";
  DROP TYPE "public"."enum_booking_page_what_to_expect_icon";`);
}
