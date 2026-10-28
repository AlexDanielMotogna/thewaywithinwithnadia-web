import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig, type Plugin } from "payload";
import sharp from "sharp";

import { AvailabilityExceptions } from "@/payload/collections/AvailabilityExceptions";
import { AvailabilityRules } from "@/payload/collections/AvailabilityRules";
import { Bookings } from "@/payload/collections/Bookings";
import { ContactMessages } from "@/payload/collections/ContactMessages";
import { Enquiries } from "@/payload/collections/Enquiries";
import { Media } from "@/payload/collections/Media";
import { Pages } from "@/payload/collections/Pages";
import { Services } from "@/payload/collections/Services";
import { Users } from "@/payload/collections/Users";
import { BookingSettings } from "@/payload/globals/BookingSettings";
import { Navigation } from "@/payload/globals/Navigation";
import { SiteSettings } from "@/payload/globals/SiteSettings";
import { processBookingSideEffectsTask } from "@/payload/jobs/process-booking-side-effects";
import { removeBookingCalendarEventTask } from "@/payload/jobs/remove-booking-calendar-event";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Supabase Storage (S3-compatible, ENGINEERING.md §6). Missing credentials →
// Payload falls back to local disk, never a fabricated connection.
const hasS3Credentials =
  process.env.S3_ENDPOINT &&
  process.env.S3_REGION &&
  process.env.S3_BUCKET &&
  process.env.S3_ACCESS_KEY_ID &&
  process.env.S3_SECRET_ACCESS_KEY;

const plugins: Plugin[] = hasS3Credentials
  ? [
      s3Storage({
        collections: { [Media.slug]: true },
        bucket: process.env.S3_BUCKET ?? "",
        config: {
          endpoint: process.env.S3_ENDPOINT ?? "",
          region: process.env.S3_REGION ?? "",
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
          },
          forcePathStyle: true,
        },
      }),
    ]
  : [];

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? "",
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Pages,
    Services,
    Bookings,
    AvailabilityRules,
    AvailabilityExceptions,
    Enquiries,
    ContactMessages,
  ],
  globals: [SiteSettings, Navigation, BookingSettings],
  plugins,
  // ENGINEERING.md §5.5 — booking side effects (calendar + confirmation
  // email) run as a queued, idempotent job, never inline in the request
  // that creates the booking. autoRun works because the app runs as a
  // persistent Node process on Railway (PENDING.md #14), not serverless.
  jobs: {
    tasks: [processBookingSideEffectsTask, removeBookingCalendarEventTask],
    autoRun: [{ cron: "*/1 * * * *" }],
  },
  editor: lexicalEditor(),
  localization: {
    locales: ["en", "de"],
    defaultLocale: "en",
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    migrationDir: path.resolve(dirname, "payload/migrations"),
    push: false,
  }),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
