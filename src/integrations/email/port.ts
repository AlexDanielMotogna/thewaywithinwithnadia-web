import type { Result } from "@/lib/result";

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
};

export type MailerError = { kind: "send_failed"; cause?: unknown };

export interface Mailer {
  send(message: MailMessage): Promise<Result<undefined, MailerError>>;
}
