import "server-only";
import { z } from "zod";
import type { Mailer } from "@/integrations/email/port";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

// Parsed at the boundary (ENGINEERING.md §6): only the id is used.
const sentSchema = z.object({ id: z.string() });

/**
 * Real adapter for Resend's HTTP API — plain `fetch`, no SDK dependency.
 * Every failure (network, 4xx/5xx, unexpected body) becomes a
 * `send_failed` value, so the calling job throws and gets retried.
 */
export function createResendMailer(input: {
  apiKey: string;
  from: string;
}): Mailer {
  return {
    async send(message) {
      try {
        const response = await fetch(RESEND_ENDPOINT, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${input.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: input.from,
            to: [message.to],
            subject: message.subject,
            text: message.text,
            ...(message.replyTo ? { reply_to: message.replyTo } : {}),
          }),
        });
        if (!response.ok) {
          return {
            ok: false,
            error: {
              kind: "send_failed",
              cause: `Resend responded ${String(response.status)}: ${await response.text()}`,
            },
          };
        }
        const parsed = sentSchema.safeParse(await response.json());
        if (!parsed.success) {
          return {
            ok: false,
            error: { kind: "send_failed", cause: parsed.error },
          };
        }
        return { ok: true, value: undefined };
      } catch (cause) {
        return { ok: false, error: { kind: "send_failed", cause } };
      }
    },
  };
}
