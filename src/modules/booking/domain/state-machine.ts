import type { Result } from "@/lib/result";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "rescheduled"
  | "cancelled"
  | "completed"
  | "no_show";

export type TransitionError = {
  kind: "invalid_transition";
  from: BookingStatus;
  to: BookingStatus;
};

// ENGINEERING.md §5.4. `satisfies` forces every current and future
// `BookingStatus` to have an entry here — the build breaks before a status
// can silently have no defined transitions. `rescheduled` is terminal for
// this record; the replacement booking carries on as its own `pending`.
const TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["rescheduled", "cancelled", "completed", "no_show"],
  rescheduled: [],
  cancelled: [],
  completed: [],
  no_show: [],
} as const satisfies Record<BookingStatus, readonly BookingStatus[]>;

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  const allowed: readonly BookingStatus[] = TRANSITIONS[from];
  return allowed.includes(to);
}

/**
 * The single path for every booking status change (ENGINEERING.md §5.4) —
 * the admin's Payload hooks call this too, so there is no second path that
 * skips the rules.
 */
export function transition(
  from: BookingStatus,
  to: BookingStatus,
): Result<BookingStatus, TransitionError> {
  if (!canTransition(from, to)) {
    return { ok: false, error: { kind: "invalid_transition", from, to } };
  }
  return { ok: true, value: to };
}
