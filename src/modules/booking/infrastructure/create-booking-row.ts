import "server-only";
import config from "@payload-config";
import { getPayload } from "payload";
import type { Result } from "@/lib/result";

export interface CreateBookingRowInput {
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  serviceId: number;
  startsAt: Date;
  durationMin: number;
  bufferMin: number;
  mode: "online" | "in_person";
  locale: "en" | "de";
  notes: string | null;
  priceAmount: number | null;
  currency: string;
}

export type CreateBookingRowError =
  { kind: "slot_taken" } | { kind: "write_failed"; cause?: unknown };

// The exclusion constraint (ENGINEERING.md §5.3) rejects an overlapping
// insert with Postgres error code 23P01. Payload/Drizzle wrap the
// underlying `pg` error in their own Error, so walk `cause` to find it
// rather than assuming a specific wrapper shape.
function isExclusionViolation(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 5 && current; depth += 1) {
    if (
      typeof current === "object" &&
      "code" in current &&
      current.code === "23P01"
    ) {
      return true;
    }
    current = current instanceof Error ? current.cause : undefined;
  }
  return false;
}

export async function createBookingRow(
  input: CreateBookingRowInput,
): Promise<Result<{ id: number }, CreateBookingRowError>> {
  const payload = await getPayload({ config });
  try {
    const created = await payload.create({
      collection: "bookings",
      data: {
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        clientPhone: input.clientPhone,
        service: input.serviceId,
        startsAt: input.startsAt.toISOString(),
        durationMin: input.durationMin,
        bufferMin: input.bufferMin,
        mode: input.mode,
        locale: input.locale,
        // Confirmed straight away (Master Doc §12: "confirm the booking,
        // receive automatic confirmation"). `pending` stays in the state
        // machine for a future approval or payment step.
        status: "confirmed",
        notes: input.notes,
        priceAmount: input.priceAmount,
        currency: input.currency,
      },
    });
    return { ok: true, value: { id: created.id } };
  } catch (error) {
    if (isExclusionViolation(error)) {
      return { ok: false, error: { kind: "slot_taken" } };
    }
    return { ok: false, error: { kind: "write_failed", cause: error } };
  }
}
