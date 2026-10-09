import "server-only";
import { consoleMailer } from "@/integrations/email/console";
import type { Mailer } from "@/integrations/email/port";

/**
 * No email provider credentials yet (PENDING.md #4) — always the console
 * adapter for now. Swap the selection here once Resend/Postmark keys land;
 * callers never change.
 */
export function getMailer(): Mailer {
  return consoleMailer;
}
