import "server-only";
import { createHash } from "node:crypto";
import { env } from "@/lib/env";

/**
 * Stable calendar event id for a booking, so a retried create finds the
 * event instead of duplicating it. Includes the site URL because a dev
 * database may be pointed at the same Google calendar as production, and
 * both start their booking ids at 1. Hex only: valid in a Google event id.
 */
export function calendarEventKey(bookingId: number): string {
  return createHash("sha256")
    .update(`${env.NEXT_PUBLIC_SITE_URL}|booking|${String(bookingId)}`)
    .digest("hex");
}
