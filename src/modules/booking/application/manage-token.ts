import "server-only";
import { env } from "@/lib/env";
import type { Result } from "@/lib/result";
import { signToken, verifyToken } from "@/lib/signed-token";

// The link in the confirmation email that lets a client cancel or move
// their booking without an account (LEGAL.md §7.6). It names one booking
// and expires when the session starts. It is effectively single-use: once
// the booking is cancelled or rescheduled it is no longer active, and the
// use cases refuse it.
const PURPOSE = "booking-manage";

export function createManageToken(booking: {
  id: number;
  startsAt: Date;
}): string {
  return signToken({
    data: String(booking.id),
    secret: env.PAYLOAD_SECRET,
    purpose: PURPOSE,
    expiresAt: booking.startsAt,
  });
}

export function readManageToken(
  token: string,
  now: Date,
): Result<number, { kind: "invalid_link" }> {
  const verified = verifyToken({
    token,
    secret: env.PAYLOAD_SECRET,
    purpose: PURPOSE,
    now,
  });
  if (!verified.ok) return { ok: false, error: { kind: "invalid_link" } };
  const id = Number(verified.value);
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, error: { kind: "invalid_link" } };
  }
  return { ok: true, value: id };
}
