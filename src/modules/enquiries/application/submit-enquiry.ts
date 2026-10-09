import "server-only";
import { getMailer } from "@/integrations/email/container";
import { getSiteSettings } from "@/modules/content";
import { createEnquiry } from "@/modules/enquiries/infrastructure/create-enquiry";
import { enquiryFormSchema } from "@/modules/enquiries/schemas";
import {
  protectPublicAction,
  type ProtectionError,
} from "@/lib/protect-public-action";
import type { Result } from "@/lib/result";

export type EnquiryError = ProtectionError | { kind: "invalid" };

type SubmitEnquiryInput = {
  values: unknown;
  honeypot: string;
  turnstileToken?: string | undefined;
  ip: string;
};

export async function submitEnquiry({
  values,
  honeypot,
  turnstileToken,
  ip,
}: SubmitEnquiryInput): Promise<Result<undefined, EnquiryError>> {
  const protection = await protectPublicAction({
    honeypot,
    turnstileToken,
    rateLimitKey: `enquiry:${ip}`,
  });
  if (!protection.ok) return protection;

  const parsed = enquiryFormSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: { kind: "invalid" } };

  await createEnquiry(parsed.data);

  const settings = await getSiteSettings();
  if (settings.email) {
    await getMailer().send({
      to: settings.email,
      subject: `New Hotels & Spas enquiry: ${parsed.data.propertyName}`,
      text: `From: ${parsed.data.contactPerson} <${parsed.data.email}>\nPhone: ${parsed.data.phone ?? "—"}\nLocation: ${parsed.data.location ?? "—"}\nCollaboration type: ${parsed.data.collaborationType ?? "—"}\nPreferred dates: ${parsed.data.preferredDates ?? "—"}\nParticipants: ${parsed.data.participants === undefined ? "—" : String(parsed.data.participants)}\n\n${parsed.data.message}`,
    });
  }

  return { ok: true, value: undefined };
}
