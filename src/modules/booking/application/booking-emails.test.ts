import { describe, expect, it } from "vitest";
import {
  clientCancellationEmail,
  clientConfirmationEmail,
  ownerNewBookingEmail,
  type BookingEmailFacts,
} from "@/modules/booking/application/booking-emails";

const facts: BookingEmailFacts = {
  locale: "en",
  clientName: "Anna",
  clientEmail: "anna@example.com",
  clientPhone: null,
  notes: null,
  serviceName: "Meditation",
  // 10:00 in Vienna (CEST, UTC+2)
  startsAt: new Date("2026-06-10T08:00:00.000Z"),
  durationMin: 60,
  timezone: "Europe/Vienna",
  mode: "in_person",
  priceAmount: 0,
  currency: "EUR",
  meetingUrl: null,
};

const base = {
  manageUrl: "https://site.test/en/book/manage?token=abc",
  changeNoticeHours: 0,
  ownerEmail: "hello@site.test",
};

describe("clientConfirmationEmail", () => {
  it("states the time in the business timezone, not UTC", () => {
    const mail = clientConfirmationEmail({ facts, ...base });
    expect(mail.text).toContain("10:00");
    expect(mail.text).toContain("Europe/Vienna");
    expect(mail.text).not.toContain("08:00");
  });

  it("includes the manage link and replies go to Nadia", () => {
    const mail = clientConfirmationEmail({ facts, ...base });
    expect(mail.to).toBe("anna@example.com");
    expect(mail.text).toContain(base.manageUrl);
    expect(mail.replyTo).toBe("hello@site.test");
  });

  it("does not mention a price when the service is free", () => {
    const mail = clientConfirmationEmail({ facts, ...base });
    expect(mail.text).not.toContain("Price");
  });

  it("states the price when there is one", () => {
    const mail = clientConfirmationEmail({
      facts: { ...facts, priceAmount: 80 },
      ...base,
    });
    expect(mail.text).toContain("€80.00");
  });

  it("only mentions the change deadline when one is set", () => {
    expect(clientConfirmationEmail({ facts, ...base }).text).not.toContain(
      "hours before",
    );
    expect(
      clientConfirmationEmail({ facts, ...base, changeNoticeHours: 24 }).text,
    ).toContain("24 hours before");
  });

  it("gives the meeting link for online sessions, or says it follows", () => {
    const online = { ...facts, mode: "online" as const };
    expect(clientConfirmationEmail({ facts: online, ...base }).text).toContain(
      "sent to you separately",
    );
    expect(
      clientConfirmationEmail({
        facts: { ...online, meetingUrl: "https://meet.google.com/abc" },
        ...base,
      }).text,
    ).toContain("https://meet.google.com/abc");
  });

  it("is written in German for German bookings", () => {
    const mail = clientConfirmationEmail({
      facts: { ...facts, locale: "de" },
      ...base,
    });
    expect(mail.subject).toBe("Ihre Sitzung ist gebucht: Meditation");
    expect(mail.text).toContain("Hallo Anna");
  });
});

describe("other booking emails", () => {
  it("cancellation links back to booking", () => {
    const mail = clientCancellationEmail({
      facts,
      bookUrl: "https://site.test/en/book",
      ownerEmail: null,
    });
    expect(mail.subject).toContain("cancelled");
    expect(mail.text).toContain("https://site.test/en/book");
    expect(mail.replyTo).toBeUndefined();
  });

  it("owner notification goes to Nadia, in English, reply-to the client", () => {
    const mail = ownerNewBookingEmail({
      facts: { ...facts, locale: "de", clientPhone: "+43 1 234" },
      ownerEmail: "hello@site.test",
      adminUrl: "https://site.test/admin/collections/bookings/1",
    });
    expect(mail.to).toBe("hello@site.test");
    expect(mail.replyTo).toBe("anna@example.com");
    expect(mail.subject).toBe("New booking: Meditation — Anna");
    expect(mail.text).toContain("+43 1 234");
  });
});
