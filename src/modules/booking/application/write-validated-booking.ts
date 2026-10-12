import "server-only";
import config from "@payload-config";
import { getPayload } from "payload";
import {
  addDaysToDateString,
  zonedDateString,
  zonedWallTimeToUtc,
} from "@/lib/dates";
import type { Result } from "@/lib/result";
import { computeAvailableSlots } from "@/modules/booking/domain/slots";
import { loadAvailabilityContext } from "@/modules/booking/infrastructure/availability-context";
import { createBookingRow } from "@/modules/booking/infrastructure/create-booking-row";
import { getBookingSettings } from "@/modules/booking/infrastructure/get-booking-settings";
import { getServiceById } from "@/modules/booking/infrastructure/get-service";
import {
  bookingFormSchema,
  type BookingFormValues,
} from "@/modules/booking/schemas";

export type WriteValidatedBookingError =
  | { kind: "invalid" }
  | { kind: "service_unavailable" }
  | { kind: "slot_taken" };

/**
 * The shared core of "validate this slot is still free, then write the
 * booking row and queue its side-effect job" — used by both the public
 * `createBooking` (wrapped in `protectPublicAction`) and the admin-only
 * `rescheduleBooking` (no honeypot/Turnstile; the caller is authenticated).
 */
export async function writeValidatedBooking(
  values: BookingFormValues,
): Promise<Result<{ bookingId: number }, WriteValidatedBookingError>> {
  const parsed = bookingFormSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: { kind: "invalid" } };

  const service = await getServiceById(parsed.data.serviceId);
  if (!service?.bookingEnabled || !service.durationMin) {
    return { ok: false, error: { kind: "service_unavailable" } };
  }

  const settings = await getBookingSettings();
  const startsAt = new Date(parsed.data.startsAt);

  // Re-check the chosen slot is still actually free right before writing —
  // the exclusion constraint (ENGINEERING.md §5.3) is the final guarantee
  // against a race, but this gives a clean "slot_taken" result instead of
  // a raw DB error in the common (non-racing) case.
  const dateString = zonedDateString(startsAt, settings.timezone);
  const dayRange = {
    from: zonedWallTimeToUtc(dateString, "00:00", settings.timezone),
    to: zonedWallTimeToUtc(
      addDaysToDateString(dateString, 1),
      "00:00",
      settings.timezone,
    ),
  };
  const context = await loadAvailabilityContext({
    range: dayRange,
    timezone: settings.timezone,
  });
  const candidateSlots = computeAvailableSlots({
    range: dayRange,
    now: new Date(),
    timezone: settings.timezone,
    weeklyRules: context.weeklyRules,
    exceptions: context.exceptions,
    busy: context.busy,
    service: {
      durationMin: service.durationMin,
      bufferMin: settings.bufferMin,
    },
    minNoticeMin: settings.minNoticeMin,
    stepMin: settings.stepMin,
  });
  const stillAvailable = candidateSlots.some(
    (slot) => slot.start.getTime() === startsAt.getTime(),
  );
  if (!stillAvailable) return { ok: false, error: { kind: "slot_taken" } };

  const created = await createBookingRow({
    clientName: parsed.data.clientName,
    clientEmail: parsed.data.clientEmail,
    clientPhone: parsed.data.clientPhone ?? null,
    serviceId: parsed.data.serviceId,
    startsAt,
    durationMin: service.durationMin,
    bufferMin: settings.bufferMin,
    mode: parsed.data.mode,
    notes: parsed.data.notes ?? null,
    priceAmount: service.price ?? null,
    currency: service.currency,
  });
  if (!created.ok) {
    if (created.error.kind === "slot_taken") {
      return { ok: false, error: { kind: "slot_taken" } };
    }
    throw new Error("Failed to write booking", { cause: created.error.cause });
  }

  // Commit first, then jobs (ENGINEERING.md §5.5) — the booking is already
  // written; this only queues the calendar/email side effects, it never
  // runs them inline. A queue failure is logged, not surfaced to the
  // caller: the booking itself still succeeded.
  try {
    const payload = await getPayload({ config });
    await payload.jobs.queue({
      task: "processBookingSideEffects",
      input: { bookingId: created.value.id },
    });
  } catch (error) {
    console.error("Failed to queue processBookingSideEffects job", error);
  }

  return { ok: true, value: { bookingId: created.value.id } };
}
