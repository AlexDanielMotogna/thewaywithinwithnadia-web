import "server-only";
import { loadCalendar } from "@/modules/calendar";
import { removesCalendarEvent } from "@/modules/booking/domain/state-machine";
import { getBookingById } from "@/modules/booking/infrastructure/get-booking";
import { clearCalendarEvent } from "@/modules/booking/infrastructure/update-booking-side-effects";

/**
 * Runs as a job once a booking's session will no longer take place
 * (cancelled or rescheduled) or the booking was deleted in the admin,
 * whichever path made the change (ENGINEERING.md §5.5). A completed or
 * no-show session keeps its event. Idempotent: `calendarEventId` is cleared
 * after the delete, and Google answers an already-deleted event with
 * 404/410, which the adapter treats as success. Throws on a calendar
 * failure so the job is retried.
 */
export async function removeBookingCalendarEvent(input: {
  bookingId: number;
  calendarEventId: string | null;
}): Promise<void> {
  const booking = await getBookingById(input.bookingId);

  let eventId: string | null;
  if (booking) {
    if (!removesCalendarEvent(booking.status)) return;
    eventId = booking.calendarEventId ?? null;
  } else {
    // Deleted in the admin: the hook passed the event ID along.
    eventId = input.calendarEventId;
  }
  if (!eventId) return;

  const calendar = await loadCalendar();
  const deleted = await calendar.deleteEvent(eventId);
  if (!deleted.ok) {
    throw new Error(
      `Failed to delete calendar event for booking ${String(input.bookingId)}`,
      { cause: deleted.error },
    );
  }
  if (booking) await clearCalendarEvent(booking.id);
}
