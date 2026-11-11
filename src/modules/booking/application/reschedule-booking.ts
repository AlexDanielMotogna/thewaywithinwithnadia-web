import "server-only";
import type { Result } from "@/lib/result";
import {
  writeValidatedBooking,
  type WriteValidatedBookingError,
} from "@/modules/booking/application/write-validated-booking";
import type { TransitionError } from "@/modules/booking/domain/state-machine";
import { transition } from "@/modules/booking/domain/state-machine";
import { getBookingById } from "@/modules/booking/infrastructure/get-booking";
import { updateBookingStatus } from "@/modules/booking/infrastructure/update-booking-status";
import {
  rescheduleBookingInputSchema,
  type RescheduleBookingInput,
} from "@/modules/booking/schemas";

export type RescheduleBookingError =
  | { kind: "invalid" }
  | { kind: "not_found" }
  | TransitionError
  | WriteValidatedBookingError;

/**
 * Creates a new booking at the requested time, then — only once that write
 * has actually succeeded — moves the old one to the terminal `rescheduled`
 * state (ENGINEERING.md §5.4: the new booking carries on as its own
 * record). Ordered this way so a failed reschedule (e.g. the new slot
 * was taken) never leaves the client without any valid booking at all.
 */
export async function rescheduleBooking(
  input: RescheduleBookingInput,
): Promise<Result<{ bookingId: number }, RescheduleBookingError>> {
  const parsed = rescheduleBookingInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: { kind: "invalid" } };

  const booking = await getBookingById(parsed.data.bookingId);
  if (!booking) return { ok: false, error: { kind: "not_found" } };

  const canTransition = transition(booking.status, "rescheduled");
  if (!canTransition.ok) return canTransition;

  const created = await writeValidatedBooking({
    serviceId:
      typeof booking.service === "number"
        ? booking.service
        : booking.service.id,
    startsAt: parsed.data.newStartsAt,
    mode: booking.mode,
    locale: booking.locale,
    clientName: booking.clientName,
    clientEmail: booking.clientEmail,
    clientPhone: booking.clientPhone ?? undefined,
    notes: booking.notes ?? undefined,
  });
  if (!created.ok) return created;

  // The old calendar event is removed by a job queued from the Bookings
  // `afterChange` hook.
  await updateBookingStatus(booking.id, canTransition.value);

  return { ok: true, value: created.value };
}
