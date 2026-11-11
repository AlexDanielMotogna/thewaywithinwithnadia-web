import "server-only";
import type { Result } from "@/lib/result";
import { serviceIdOf } from "@/modules/booking/application/booking-email-facts";
import { cancelBooking } from "@/modules/booking/application/cancel-booking";
import { readManageToken } from "@/modules/booking/application/manage-token";
import {
  rescheduleBooking,
  type RescheduleBookingError,
} from "@/modules/booking/application/reschedule-booking";
import { isActiveBooking } from "@/modules/booking/domain/state-machine";
import { getBookingById } from "@/modules/booking/infrastructure/get-booking";
import { getBookingSettings } from "@/modules/booking/infrastructure/get-booking-settings";
import { getServiceById } from "@/modules/booking/infrastructure/get-service";
import type { Booking } from "@/payload-types";

// Cancel / reschedule through the signed link in the confirmation email
// (LEGAL.md §7.6) — no account. The link is checked on every call, never
// trusted from an earlier page view.

export type ManageBookingError =
  | { kind: "invalid_link" }
  | { kind: "not_active" }
  | { kind: "too_late"; hours: number };

export interface ManagedBooking {
  serviceId: number;
  serviceName: string;
  startsAt: string;
  durationMin: number;
  mode: "online" | "in_person";
  /** Business timezone; times are shown in it. */
  timezone: string;
}

async function loadManageable(
  token: string,
  now: Date,
): Promise<Result<{ booking: Booking; timezone: string }, ManageBookingError>> {
  const id = readManageToken(token, now);
  if (!id.ok) return id;

  const booking = await getBookingById(id.value);
  if (!booking) return { ok: false, error: { kind: "invalid_link" } };
  if (!isActiveBooking(booking.status)) {
    return { ok: false, error: { kind: "not_active" } };
  }

  const settings = await getBookingSettings();
  const hours = settings.clientChangeNoticeHours;
  const deadline = new Date(booking.startsAt).getTime() - hours * 3_600_000;
  if (now.getTime() >= deadline) {
    return { ok: false, error: { kind: "too_late", hours } };
  }
  return { ok: true, value: { booking, timezone: settings.timezone } };
}

export async function getManagedBooking(
  token: string,
): Promise<Result<ManagedBooking, ManageBookingError>> {
  const loaded = await loadManageable(token, new Date());
  if (!loaded.ok) return loaded;
  const { booking, timezone } = loaded.value;
  const serviceId = serviceIdOf(booking);
  const service = await getServiceById(serviceId);
  return {
    ok: true,
    value: {
      serviceId,
      serviceName: service?.name ?? "",
      startsAt: booking.startsAt,
      durationMin: booking.durationMin,
      mode: booking.mode,
      timezone,
    },
  };
}

export async function cancelBookingAsClient(
  token: string,
): Promise<Result<undefined, ManageBookingError | { kind: "failed" }>> {
  const loaded = await loadManageable(token, new Date());
  if (!loaded.ok) return loaded;
  const cancelled = await cancelBooking(loaded.value.booking.id);
  return cancelled.ok ? cancelled : { ok: false, error: { kind: "failed" } };
}

export async function rescheduleBookingAsClient(input: {
  token: string;
  newStartsAt: string;
}): Promise<Result<undefined, ManageBookingError | RescheduleBookingError>> {
  const loaded = await loadManageable(input.token, new Date());
  if (!loaded.ok) return loaded;
  const moved = await rescheduleBooking({
    bookingId: loaded.value.booking.id,
    newStartsAt: input.newStartsAt,
  });
  return moved.ok ? { ok: true, value: undefined } : moved;
}
