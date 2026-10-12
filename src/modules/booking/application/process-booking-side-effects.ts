import "server-only";
import { getCalendar } from "@/integrations/calendar/container";
import { getMailer } from "@/integrations/email/container";
import { getBookingById } from "@/modules/booking/infrastructure/get-booking";
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
 * or send a duplicate email.
 */
export async function processBookingSideEffects(
  bookingId: number,
): Promise<void> {
  const booking = await getBookingById(bookingId);
  if (!booking) return;

  let meetingUrl = booking.meetingUrl ?? null;

  if (!booking.calendarEventId) {
    const service = await getServiceById(
      typeof booking.service === "number"
        ? booking.service
        : booking.service.id,
    );
    const start = new Date(booking.startsAt);
    const end = new Date(start.getTime() + booking.durationMin * 60_000);

    const result = await getCalendar().createEvent({
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
    }
    // Calendar failure is not fatal here: the job framework's own retry
    // (ENGINEERING.md §5.5) will try again on the next run, since
    // `calendarEventId` is still unset.
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
    }
  }
}
