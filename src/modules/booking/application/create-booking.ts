import "server-only";
import type { ProtectionError } from "@/lib/protect-public-action";
import { protectPublicAction } from "@/lib/protect-public-action";
import type { Result } from "@/lib/result";
import {
  writeValidatedBooking,
  type WriteValidatedBookingError,
} from "@/modules/booking/application/write-validated-booking";
import type { BookingFormValues } from "@/modules/booking/schemas";

export type CreateBookingError = ProtectionError | WriteValidatedBookingError;

export interface CreateBookingInput {
  values: BookingFormValues;
  honeypot: string;
  turnstileToken: string | undefined;
  ip: string;
}

export async function createBooking(
  input: CreateBookingInput,
): Promise<Result<{ bookingId: number }, CreateBookingError>> {
  const protection = await protectPublicAction({
    honeypot: input.honeypot,
    turnstileToken: input.turnstileToken,
    rateLimitKey: `booking:${input.ip}`,
  });
  if (!protection.ok) return protection;

  return writeValidatedBooking(input.values);
}
