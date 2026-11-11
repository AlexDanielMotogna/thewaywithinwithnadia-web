import "server-only";
import type { Mailer } from "@/integrations/email/port";
import { env } from "@/lib/env";

/**
 * Fake adapter: logs instead of sending (PENDING.md #4). In development it
 * prints the whole email as one plain-text string (readable in the
 * terminal and in Next's dev log, which shows logged objects as `{}`). In
 * production it never logs the content: emails carry client personal data
 * (ENGINEERING.md §10), so only the fact that nothing was sent is logged.
 */
export const consoleMailer: Mailer = {
  send(message) {
    if (env.NODE_ENV === "production") {
      console.warn(
        "[email:console] No email provider configured, email not sent:",
        message.subject.split(":")[0],
      );
      return Promise.resolve({ ok: true, value: undefined });
    }
    const header = [
      `To: ${message.to}`,
      ...(message.replyTo ? [`Reply-To: ${message.replyTo}`] : []),
      `Subject: ${message.subject}`,
    ].join("\n");
    console.log(`[email:console]\n${header}\n\n${message.text}\n[/email]`);
    return Promise.resolve({ ok: true, value: undefined });
  },
};
