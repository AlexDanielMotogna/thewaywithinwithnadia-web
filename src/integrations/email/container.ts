import "server-only";
import { consoleMailer } from "@/integrations/email/console";
import type { Mailer } from "@/integrations/email/port";
import { createResendMailer } from "@/integrations/email/resend";
import { env } from "@/lib/env";

/**
 * The one place the mail adapter is chosen (ENGINEERING.md §6). With
 * `RESEND_API_KEY` + `EMAIL_FROM` set, mail really goes out; without them
 * it is only logged (PENDING.md #4). Callers never change.
 */
export function getMailer(): Mailer {
  if (env.RESEND_API_KEY && env.EMAIL_FROM) {
    return createResendMailer({
      apiKey: env.RESEND_API_KEY,
      from: env.EMAIL_FROM,
    });
  }
  return consoleMailer;
}
