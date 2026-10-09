import "server-only";
import { getMailer } from "@/integrations/email/container";
import { getSiteSettings } from "@/modules/content";
import { createContactMessage } from "@/modules/contact/infrastructure/create-contact-message";
import { contactFormSchema } from "@/modules/contact/schemas";
import {
  protectPublicAction,
  type ProtectionError,
} from "@/lib/protect-public-action";
import type { Result } from "@/lib/result";

export type ContactMessageError = ProtectionError | { kind: "invalid" };

type SubmitContactMessageInput = {
  values: unknown;
  honeypot: string;
  turnstileToken?: string | undefined;
  ip: string;
};

export async function submitContactMessage({
  values,
  honeypot,
  turnstileToken,
  ip,
}: SubmitContactMessageInput): Promise<Result<undefined, ContactMessageError>> {
  const protection = await protectPublicAction({
    honeypot,
    turnstileToken,
    rateLimitKey: `contact:${ip}`,
  });
  if (!protection.ok) return protection;

  const parsed = contactFormSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: { kind: "invalid" } };

  await createContactMessage(parsed.data);

  const settings = await getSiteSettings();
  if (settings.email) {
    await getMailer().send({
      to: settings.email,
      subject: `New contact message: ${parsed.data.subject}`,
      text: `From: ${parsed.data.name} <${parsed.data.email}>\nPhone: ${parsed.data.phone ?? "—"}\n\n${parsed.data.message}`,
    });
  }

  return { ok: true, value: undefined };
}
