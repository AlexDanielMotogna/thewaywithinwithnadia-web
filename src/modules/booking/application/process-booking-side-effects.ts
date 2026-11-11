import "server-only";
import { getMailer } from "@/integrations/email/container";
import { loadCalendar } from "@/modules/calendar";
import {
  clientConfirmationEmail,
  ownerNewBookingEmail,
} from "@/modules/booking/application/booking-emails";
import { loadBookingEmailFacts } from "@/modules/booking/application/booking-email-facts";
import {
  adminBookingUrl,
  manageBookingUrl,
} from "@/modules/booking/application/booking-links";
import { isActiveBooking } from "@/modules/booking/domain/state-machine";
import { calendarEventKey } from "@/modules/booking/infrastructure/calendar-event-key";
import { getBookingById } from "@/modules/booking/infrastructure/get-booking";
import { getBookingSettings } from "@/modules/booking/infrastructure/get-booking-settings";
import { getOwnerEmail } from "@/modules/booking/infrastructure/get-owner-email";
import {
  markCalendarSynced,
  markConfirmationSent,
  markOwnerNotified,
} from "@/modules/booking/infrastructure/update-booking-side-effects";

/**
 * The booking write itself already committed (ENGINEERING.md §5.5) — this
 * runs afterwards, as a Payload job (see `src/payload/jobs`), never inline
 * in the request that created the booking. Idempotent: each step checks
 * its own stored marker (`calendarEventId`, `confirmationSentAt`,
 * `ownerNotifiedAt`) and skips if already done, so a retry can never create
 * a duplicate calendar event or send a duplicate email. Throws when a step
 * failed, so the job is retried; steps that already succeeded are skipped.
 */
export async function processBookingSideEffects(
  bookingId: number,
): Promise<void> {
  const booking = await getBookingById(bookingId);
  if (!booking) return;
  // Cancelled before the job ran: no calendar event, no emails.
  if (!isActiveBooking(booking.status)) return;

  const settings = await getBookingSettings();
  const facts = await loadBookingEmailFacts(booking, settings.timezone);
  const failures: string[] = [];

  if (!booking.calendarEventId) {
    const calendar = await loadCalendar();
    const result = await calendar.createEvent({
      eventKey: calendarEventKey(booking.id),
      timezone: settings.timezone,
      title: `${facts.serviceName} — ${booking.clientName}`,
      description: [
        booking.clientEmail,
        booking.clientPhone ?? "",
        booking.notes ?? "",
      ]
        .filter(Boolean)
        .join("\n"),
      start: facts.startsAt,
      end: new Date(facts.startsAt.getTime() + booking.durationMin * 60_000),
      attendeeEmail: booking.clientEmail,
      withMeet: booking.mode === "online",
    });

    if (result.ok) {
      facts.meetingUrl = result.value.meetUrl;
      await markCalendarSynced(booking.id, {
        calendarEventId: result.value.eventId,
        meetingUrl: result.value.meetUrl,
      });
    } else {
      // Still send the emails below; the retry only redoes this step.
      failures.push("calendar");
    }
  }

  const ownerEmail = await getOwnerEmail();
  const mailer = getMailer();

  if (!booking.confirmationSentAt) {
    const sent = await mailer.send(
      clientConfirmationEmail({
        facts,
        manageUrl: manageBookingUrl({
          id: booking.id,
          startsAt: facts.startsAt,
          locale: booking.locale,
        }),
        changeNoticeHours: settings.clientChangeNoticeHours,
        ownerEmail,
      }),
    );
    if (sent.ok) await markConfirmationSent(booking.id, new Date());
    else failures.push("confirmation email");
  }

  if (!booking.ownerNotifiedAt) {
    if (ownerEmail) {
      const sent = await mailer.send(
        ownerNewBookingEmail({
          facts,
          ownerEmail,
          adminUrl: adminBookingUrl(booking.id),
        }),
      );
      if (sent.ok) await markOwnerNotified(booking.id, new Date());
      else failures.push("owner notification");
    } else {
      // Not a failure worth retrying: there is nobody to notify until an
      // email is set in Site Settings. The booking is in the admin anyway.
      console.warn("No Site Settings email, owner not notified", booking.id);
    }
  }

  if (failures.length > 0) {
    throw new Error(
      `Booking ${String(booking.id)} side effects failed: ${failures.join(", ")}`,
    );
  }
}
