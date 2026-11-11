"use server";

import { headers } from "next/headers";
import type { Result } from "@/lib/result";
import type { CreateBookingError } from "@/modules/booking/application/create-booking";
import { createBooking } from "@/modules/booking/application/create-booking";
import {
  cancelBookingAsClient,
  type ManageBookingError,
  rescheduleBookingAsClient,
} from "@/modules/booking/application/client-self-service";
import type { GetAvailableSlotsError } from "@/modules/booking/application/get-available-slots";
import { getAvailableSlots } from "@/modules/booking/application/get-available-slots";
import {
  manageBookingInputSchema,
  rescheduleManagedBookingInputSchema,
} from "@/modules/booking/schemas";

async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export interface SerializedSlot {
  start: string;
  end: string;
}

export interface SerializedAvailableSlots {
  slots: SerializedSlot[];
  timezone: string;
}

export async function getAvailableSlotsAction(input: {
  serviceId: number;
  from: string;
  to: string;
}): Promise<Result<SerializedAvailableSlots, GetAvailableSlotsError>> {
  const result = await getAvailableSlots(input);
  if (!result.ok) return result;
  return {
    ok: true,
    value: {
      slots: result.value.slots.map((slot) => ({
        start: slot.start.toISOString(),
        end: slot.end.toISOString(),
      })),
      timezone: result.value.timezone,
    },
  };
}

export async function createBookingAction(input: {
  values: unknown;
  honeypot: string;
  turnstileToken: string | undefined;
}): Promise<Result<{ bookingId: number }, CreateBookingError>> {
  const ip = await getClientIp();
  return createBooking({ ...input, ip });
}

export type ManageActionError =
  | { kind: "invalid_link" }
  | { kind: "not_active" }
  | { kind: "too_late"; hours: number }
  | { kind: "slot_taken" }
  | { kind: "failed" };

// The client only needs to know what to show; every other failure is "failed".
function toManageError(
  error: ManageBookingError | { kind: string },
): ManageActionError {
  if ("hours" in error) return { kind: "too_late", hours: error.hours };
  if (
    error.kind === "invalid_link" ||
    error.kind === "not_active" ||
    error.kind === "slot_taken"
  ) {
    return { kind: error.kind };
  }
  return { kind: "failed" };
}

export async function cancelManagedBookingAction(input: {
  token: string;
}): Promise<Result<undefined, ManageActionError>> {
  const parsed = manageBookingInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: { kind: "invalid_link" } };
  const result = await cancelBookingAsClient(parsed.data.token);
  return result.ok ? result : { ok: false, error: toManageError(result.error) };
}

export async function rescheduleManagedBookingAction(input: {
  token: string;
  newStartsAt: string;
}): Promise<Result<undefined, ManageActionError>> {
  const parsed = rescheduleManagedBookingInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: { kind: "failed" } };
  const result = await rescheduleBookingAsClient(parsed.data);
  return result.ok ? result : { ok: false, error: toManageError(result.error) };
}
