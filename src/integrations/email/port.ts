import type { Result } from "@/lib/result";

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
  /** e.g. the client's address on the owner notification, so Nadia can just reply. */
  replyTo?: string;
};

export type MailerError = { kind: "send_failed"; cause?: unknown };

export interface Mailer {
  send(message: MailMessage): Promise<Result<undefined, MailerError>>;
}
