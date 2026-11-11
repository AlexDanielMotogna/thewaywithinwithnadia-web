import { createTranslator } from "next-intl";
import type { MailMessage } from "@/integrations/email/port";
import en from "@/messages/en.json";
import de from "@/messages/de.json";

// Pure: builds the email content, sends nothing. The jobs decide when
// (and whether) to send. Copy lives in messages/*.json (`BookingEmail`).

export type EmailLocale = "en" | "de";

const messagesByLocale = { en, de } satisfies Record<EmailLocale, unknown>;

function translator(locale: EmailLocale) {
  return createTranslator({
    locale,
    messages: messagesByLocale[locale],
    namespace: "BookingEmail",
  });
}

export interface BookingEmailFacts {
  locale: EmailLocale;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  notes: string | null;
  serviceName: string;
  startsAt: Date;
  durationMin: number;
  /** IANA zone the time is written in (the business timezone). */
  timezone: string;
  mode: "online" | "in_person";
  priceAmount: number | null;
  currency: string;
  meetingUrl: string | null;
}

export function formatWhen(
  startsAt: Date,
  timezone: string,
  locale: EmailLocale,
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    dateStyle: "full",
    timeStyle: "short",
  }).format(startsAt);
}

function formatPrice(facts: BookingEmailFacts): string | null {
  // Nothing is charged through the site (PENDING.md #13); a price is only
  // stated when the service has one.
  if (!facts.priceAmount) return null;
  return new Intl.NumberFormat(facts.locale, {
    style: "currency",
    currency: facts.currency,
  }).format(facts.priceAmount);
}

function sessionLines(facts: BookingEmailFacts): string[] {
  const t = translator(facts.locale);
  const price = formatPrice(facts);
  return [
    t("service", { service: facts.serviceName }),
    t("when", {
      when: formatWhen(facts.startsAt, facts.timezone, facts.locale),
      timezone: facts.timezone,
    }),
    t("duration", { min: facts.durationMin }),
    ...(price ? [t("price", { price })] : []),
    facts.mode === "online" ? t("modeOnline") : t("modeInPerson"),
  ];
}

export function clientConfirmationEmail(input: {
  facts: BookingEmailFacts;
  manageUrl: string;
  changeNoticeHours: number;
  ownerEmail: string | null;
}): MailMessage {
  const { facts } = input;
  const t = translator(facts.locale);
  const meeting =
    facts.mode === "online"
      ? [
          facts.meetingUrl
            ? t("meetingLink", { url: facts.meetingUrl })
            : t("meetingLinkLater"),
        ]
      : [];
  const lines = [
    t("greeting", { name: facts.clientName }),
    "",
    t("confirmationIntro"),
    "",
    ...sessionLines(facts),
    ...meeting,
    "",
    t("manage", { url: input.manageUrl }),
    ...(input.changeNoticeHours > 0
      ? [t("manageDeadline", { hours: input.changeNoticeHours })]
      : []),
    ...(input.ownerEmail
      ? ["", t("contact", { email: input.ownerEmail })]
      : []),
    "",
    t("signature"),
  ];
  return {
    to: facts.clientEmail,
    subject: t("confirmationSubject", { service: facts.serviceName }),
    text: lines.join("\n"),
    ...(input.ownerEmail ? { replyTo: input.ownerEmail } : {}),
  };
}

export function clientCancellationEmail(input: {
  facts: BookingEmailFacts;
  bookUrl: string;
  ownerEmail: string | null;
}): MailMessage {
  const { facts } = input;
  const t = translator(facts.locale);
  const lines = [
    t("greeting", { name: facts.clientName }),
    "",
    t("cancelledIntro", {
      when: formatWhen(facts.startsAt, facts.timezone, facts.locale),
      timezone: facts.timezone,
    }),
    "",
    t("cancelledRebook", { url: input.bookUrl }),
    ...(input.ownerEmail
      ? ["", t("contact", { email: input.ownerEmail })]
      : []),
    "",
    t("signature"),
  ];
  return {
    to: facts.clientEmail,
    subject: t("cancelledSubject", { service: facts.serviceName }),
    text: lines.join("\n"),
    ...(input.ownerEmail ? { replyTo: input.ownerEmail } : {}),
  };
}

function ownerClientLines(facts: BookingEmailFacts): string[] {
  const t = translator("en");
  return [
    t("ownerClient", { name: facts.clientName, email: facts.clientEmail }),
    ...(facts.clientPhone
      ? [t("ownerPhone", { phone: facts.clientPhone })]
      : []),
    ...(facts.notes ? [t("ownerNotes", { notes: facts.notes })] : []),
  ];
}

// Owner notifications go to Nadia in English, the primary site language.
export function ownerNewBookingEmail(input: {
  facts: BookingEmailFacts;
  ownerEmail: string;
  adminUrl: string;
}): MailMessage {
  const { facts } = input;
  const t = translator("en");
  const lines = [
    t("ownerNewIntro"),
    "",
    ...sessionLines({ ...facts, locale: "en" }),
    ...(facts.meetingUrl ? [t("meetingLink", { url: facts.meetingUrl })] : []),
    "",
    ...ownerClientLines(facts),
    "",
    t("ownerAdmin", { url: input.adminUrl }),
  ];
  return {
    to: input.ownerEmail,
    subject: t("ownerNewSubject", {
      service: facts.serviceName,
      name: facts.clientName,
    }),
    text: lines.join("\n"),
    replyTo: facts.clientEmail,
  };
}

export function ownerCancellationEmail(input: {
  facts: BookingEmailFacts;
  ownerEmail: string;
  adminUrl: string;
}): MailMessage {
  const { facts } = input;
  const t = translator("en");
  const lines = [
    t("ownerCancelledIntro"),
    "",
    ...sessionLines({ ...facts, locale: "en" }),
    "",
    ...ownerClientLines(facts),
    "",
    t("ownerAdmin", { url: input.adminUrl }),
  ];
  return {
    to: input.ownerEmail,
    subject: t("ownerCancelledSubject", {
      service: facts.serviceName,
      name: facts.clientName,
    }),
    text: lines.join("\n"),
    replyTo: facts.clientEmail,
  };
}
