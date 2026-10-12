import "server-only";
import { computeAvailableSlots } from "@/modules/booking/domain/slots";
import type { Slot } from "@/modules/booking/domain/types";
import { getBookingSettings } from "@/modules/booking/infrastructure/get-booking-settings";
import { getServiceById } from "@/modules/booking/infrastructure/get-service";
import { loadAvailabilityContext } from "@/modules/booking/infrastructure/availability-context";
import {
  getAvailableSlotsInputSchema,
  type GetAvailableSlotsInput,
} from "@/modules/booking/schemas";
import type { Result } from "@/lib/result";

export type GetAvailableSlotsError =
  { kind: "invalid" } | { kind: "service_unavailable" };

export interface AvailableSlots {
  slots: Slot[];
  /** IANA business timezone — in-person times are always shown in this. */
  timezone: string;
}

export async function getAvailableSlots(
  input: GetAvailableSlotsInput,
): Promise<Result<AvailableSlots, GetAvailableSlotsError>> {
  const parsed = getAvailableSlotsInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: { kind: "invalid" } };

  const service = await getServiceById(parsed.data.serviceId);
  if (!service?.bookingEnabled || !service.durationMin) {
    return { ok: false, error: { kind: "service_unavailable" } };
  }

  const settings = await getBookingSettings();
  const range = {
    from: new Date(parsed.data.from),
    to: new Date(parsed.data.to),
  };
  const context = await loadAvailabilityContext({
    range,
    timezone: settings.timezone,
  });

  const slots = computeAvailableSlots({
    range,
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

  return { ok: true, value: { slots, timezone: settings.timezone } };
}
