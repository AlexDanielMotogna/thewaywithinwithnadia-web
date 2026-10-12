import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

// ENGINEERING.md §5.3 — the database is the guarantee against double
// booking, not the UI check. `buffer_min` is a per-booking snapshot (the
// Payload field added alongside this migration). `blocked_until` is kept in
// sync by a trigger rather than a `GENERATED ALWAYS AS` column: Postgres
// marks timestamptz arithmetic (`+ interval`) as STABLE, not IMMUTABLE, so a
// generated column referencing it is rejected ("generation expression is
// not immutable") — triggers have no such restriction, and still make it
// impossible for `blocked_until` to drift from starts_at/duration_min/
// buffer_min however the row is written (app code or the Payload admin UI).
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "bookings" ADD COLUMN "buffer_min" numeric DEFAULT 15 NOT NULL;
  ALTER TABLE "bookings" ADD COLUMN "blocked_until" timestamp(3) with time zone;

  CREATE EXTENSION IF NOT EXISTS btree_gist;

  CREATE FUNCTION "bookings_set_blocked_until"() RETURNS trigger AS $$
  BEGIN
    NEW.blocked_until := NEW.starts_at + ((NEW.duration_min + NEW.buffer_min) * interval '1 minute');
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER "bookings_blocked_until_trigger"
    BEFORE INSERT OR UPDATE ON "bookings"
    FOR EACH ROW EXECUTE FUNCTION "bookings_set_blocked_until"();

  ALTER TABLE "bookings"
    ADD CONSTRAINT "bookings_no_overlap"
    EXCLUDE USING gist (
      tstzrange(starts_at, blocked_until, '[)') WITH &&
    )
    WHERE (status IN ('pending', 'confirmed'));`);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "bookings" DROP CONSTRAINT "bookings_no_overlap";
  DROP TRIGGER "bookings_blocked_until_trigger" ON "bookings";
  DROP FUNCTION "bookings_set_blocked_until"();
  ALTER TABLE "bookings" DROP COLUMN "blocked_until";
  ALTER TABLE "bookings" DROP COLUMN "buffer_min";`);
  // btree_gist is left installed deliberately — dropping a shared Postgres
  // extension in a `down` migration is riskier than leaving it, and nothing
  // else in this schema currently depends on it either way.
}
