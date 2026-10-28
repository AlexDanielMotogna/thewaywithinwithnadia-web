import "server-only";
import { getMailer } from "@/integrations/email/container";
import { loadCalendar } from "@/modules/calendar";
import { isActiveBooking } from "@/modules/booking/domain/state-machine";
import { calendarEventKey } from "@/modules/booking/infrastructure/calendar-event-key";
import { getBookingById } from "@/modules/booking/infrastructure/get-booking";
import { getBookingSettings } from "@/modules/booking/infrastructure/get-booking-settings";
import { getServiceById } from "@/modules/booking/infrastructure/get-service";
import {
  markCalendarSynced,
  markConfirmationSent,
} from "@/modules/booking/infrastructure/update-booking-side-effects";

function serviceName(service: { name: string } | null): string {
  return service?.name ?? "session";
}

/**
 * The booking write itself already committed (ENGINEERING.md §5.5) — this
 * runs afterwards, as a Payload job (see `src/payload/jobs`), never inline
 * in the request that created the booking. Idempotent: each step checks
 * its own stored marker (`calendarEventId`, `confirmationSentAt`) and skips
 * if already done, so a retry can never create a duplicate calendar event
 * or send a duplicate email. Throws when a step failed, so the job is
 * retried; steps that already succeeded are skipped on the retry.
 */
export async function processBookingSideEffects(
  bookingId: number,
): Promise<void> {
  const booking = await getBookingById(bookingId);
  if (!booking) return;
  // Cancelled before the job ran: no calendar event, no confirmation email.
  if (!isActiveBooking(booking.status)) return;

  const failures: string[] = [];
  let meetingUrl = booking.meetingUrl ?? null;

  if (!booking.calendarEventId) {
    const service = await getServiceById(
      typeof booking.service === "number"
        ? booking.service
        : booking.service.id,
    );
    const start = new Date(booking.startsAt);
    const end = new Date(start.getTime() + booking.durationMin * 60_000);

    const [calendar, settings] = await Promise.all([
      loadCalendar(),
      getBookingSettings(),
    ]);
    const result = await calendar.createEvent({
      eventKey: calendarEventKey(booking.id),
      timezone: settings.timezone,
      title: `${serviceName(service)} — ${booking.clientName}`,
      description: booking.notes ?? "",
      start,
      end,
      attendeeEmail: booking.clientEmail,
      withMeet: booking.mode === "online",
    });

    if (result.ok) {
      meetingUrl = result.value.meetUrl;
      await markCalendarSynced(booking.id, {
        calendarEventId: result.value.eventId,
        meetingUrl,
      });
    } else {
      // Still send the confirmation below; the retry only redoes this step.
      failures.push("calendar");
    }
  }

  if (!booking.confirmationSentAt) {
    const when = new Date(booking.startsAt).toUTCString();
    const lines = [
      `Your session is booked for ${when}.`,
      booking.mode === "online"
        ? meetingUrl
          ? `Join online: ${meetingUrl}`
          : "This is an online session — the video call link will follow separately."
        : "This session is in person.",
    ];

    const result = await getMailer().send({
      to: booking.clientEmail,
      subject: "Your booking is confirmed",
      text: lines.join("\n"),
    });

    if (result.ok) {
      await markConfirmationSent(booking.id, new Date());
    } else {
      failures.push("confirmation email");
    }
  }

  if (failures.length > 0) {
    throw new Error(
      `Booking ${String(booking.id)} side effects failed: ${failures.join(", ")}`,
    );
  }
}
