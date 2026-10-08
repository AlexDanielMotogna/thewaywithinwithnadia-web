import "server-only";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),

  // Supabase Postgres — becomes required once Payload is wired in (Phase 1).
  // See .env.example for where to find these in the Supabase dashboard.
  DATABASE_URL: z.string().min(1).optional(),
  DIRECT_URL: z.string().min(1).optional(),

  // Payload CMS — becomes required once Payload is wired in (Phase 1).
  PAYLOAD_SECRET: z.string().min(1).optional(),

  // Supabase Storage (S3-compatible) — optional; a missing value means the
  // media adapter falls back to a fake/local one (ENGINEERING.md §6), never
  // a fabricated credential.
  S3_ENDPOINT: z.url().optional(),
  S3_REGION: z.string().min(1).optional(),
  S3_BUCKET: z.string().min(1).optional(),
  S3_ACCESS_KEY_ID: z.string().min(1).optional(),
  S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", z.treeifyError(parsed.error));
  throw new Error("Invalid environment variables — see log above.");
}

export const env = parsed.data;
