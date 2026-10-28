import "server-only";
import type { Result } from "@/lib/result";
import type { TransitionError } from "@/modules/booking/domain/state-machine";
import { transition } from "@/modules/booking/domain/state-machine";
import { getBookingById } from "@/modules/booking/infrastructure/get-booking";
import { updateBookingStatus } from "@/modules/booking/infrastructure/update-booking-status";

export type CancelBookingError = { kind: "not_found" } | TransitionError;

/**
 * The single path for cancelling a booking (ENGINEERING.md §5.4) — the
 * admin UI and any future client self-service flow both call this, never
 * writing `status` directly.
 */
export async function cancelBooking(
  bookingId: number,
): Promise<Result<undefined, CancelBookingError>> {
  const booking = await getBookingById(bookingId);
  if (!booking) return { ok: false, error: { kind: "not_found" } };

  const result = transition(booking.status, "cancelled");
  if (!result.ok) return result;

  // The calendar event is removed by a job queued from the Bookings
  // `afterChange` hook, the same path as a cancellation made in the admin.
  await updateBookingStatus(bookingId, result.value);

  return { ok: true, value: undefined };
}
