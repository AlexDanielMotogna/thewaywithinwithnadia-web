import "server-only";
import type { Mailer } from "@/integrations/email/port";

/** Fake adapter: logs instead of sending. Used until PENDING.md #4 resolves. */
export const consoleMailer: Mailer = {
  send(message) {
    console.log("[email:console]", message);
    return Promise.resolve({ ok: true, value: undefined });
  },
};
