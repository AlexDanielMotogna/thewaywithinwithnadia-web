import config from "@payload-config";
import { getPayload } from "payload";

/**
 * Starts Payload's job-queue cron (`jobs.autoRun` in payload.config.ts).
 * Payload only schedules it when initialised with `cron: true`; the site's
 * own code calls `getPayload({ config })` without it and only the admin
 * passes it, so booking jobs (calendar event, emails) were queued but never
 * ran unless someone had the admin open (BUGS.md). Imported only from
 * `instrumentation.ts` in the Node.js runtime. Payload skips the cron
 * itself during `next build`.
 */
export async function startPayloadCron(): Promise<void> {
  await getPayload({ config, cron: true });
}
