import "server-only";
import { getCalendar } from "@/integrations/calendar/container";
import { isActiveBooking } from "@/modules/booking/domain/state-machine";
import { getBookingById } from "@/modules/booking/infrastructure/get-booking";
import { clearCalendarEvent } from "@/modules/booking/infrastructure/update-booking-side-effects";

/**
 * Runs as a job once a booking stops being active (cancelled or
 * rescheduled), whichever path changed the status: a use case or a direct
 * edit in the admin (ENGINEERING.md §5.5). Idempotent: `calendarEventId` is
 * cleared after the delete, so a retry does nothing. Throws on a calendar
 * failure so the job is retried.
 */
export async function removeBookingCalendarEvent(
  bookingId: number,
): Promise<void> {
  const booking = await getBookingById(bookingId);
  if (!booking?.calendarEventId) return;
  if (isActiveBooking(booking.status)) return;

  const deleted = await getCalendar().deleteEvent(booking.calendarEventId);
  if (!deleted.ok) {
    throw new Error(
      `Failed to delete calendar event for booking ${String(bookingId)}`,
      { cause: deleted.error },
    );
  }
  await clearCalendarEvent(bookingId);
}
