"use server";

import { headers } from "next/headers";
import type { Result } from "@/lib/result";
import type { CreateBookingError } from "@/modules/booking/application/create-booking";
import { createBooking } from "@/modules/booking/application/create-booking";
import type { GetAvailableSlotsError } from "@/modules/booking/application/get-available-slots";
import { getAvailableSlots } from "@/modules/booking/application/get-available-slots";

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
