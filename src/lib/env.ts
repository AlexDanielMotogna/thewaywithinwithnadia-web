import "server-only";
import { z } from "zod";

// `KEY=` left empty in a .env file (as copied from .env.example) means
// "not configured", not an invalid value that stops the app from booting.
const optionalSetting = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),

  // Supabase Postgres (ENGINEERING.md §1 / §5.3). See .env.example for where
  // to find these in the Supabase dashboard. DIRECT_URL is only read by the
  // `scripts/with-direct-db.mjs` CLI wrapper (migrations), never by the app
  // at runtime, so it stays optional here.
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),

  // Payload CMS — required, the app boots Payload at startup.
  PAYLOAD_SECRET: z.string().min(1),

  // Supabase Storage (S3-compatible) — optional; a missing value means the
  // media adapter falls back to a fake/local one (ENGINEERING.md §6), never
  // a fabricated credential.
  S3_ENDPOINT: z.url().optional(),
  S3_REGION: z.string().min(1).optional(),
  S3_BUCKET: z.string().min(1).optional(),
  S3_ACCESS_KEY_ID: z.string().min(1).optional(),
  S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),

  // Cloudflare Turnstile (ENGINEERING.md §7.2 / LEGAL.md §5.1) — optional;
  // missing means public forms skip Turnstile verification entirely
  // (honeypot + rate limit still apply). See PENDING.md #10.
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),

  // Google Calendar OAuth (ENGINEERING.md §6 — CalendarProvider port).
  // Optional; missing means the fake calendar adapter is used (PENDING.md #5).
  // Currently a dev/test OAuth client authorized against Alex's personal
  // Google account — production must switch to Nadia's before launch.
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

  // Transactional email via Resend (ENGINEERING.md §1, Mailer port).
  // Optional; missing means emails are only logged to the console
  // (PENDING.md #4). EMAIL_FROM is e.g. "The Way Within <hello@…>", and its
  // domain must be verified in Resend.
  RESEND_API_KEY: optionalSetting,
  EMAIL_FROM: optionalSetting,
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", z.treeifyError(parsed.error));
  throw new Error("Invalid environment variables — see log above.");
}

export const env = parsed.data;
