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

// A booking that still holds its time slot and still needs its calendar
// event. Same set as the `WHERE` of the DB exclusion constraint
// (ENGINEERING.md §5.3, migration 20261012_184209_booking_no_overlap).
const ACTIVE_STATUSES: readonly BookingStatus[] = ["pending", "confirmed"];

export function isActiveBooking(status: BookingStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

// Whether the session's event leaves Nadia's calendar. Not the same as
// "inactive": a completed or no-show session did happen at that time and
// stays in her calendar history. A `Record` so every future status has to
// decide this explicitly.
const REMOVES_CALENDAR_EVENT = {
  pending: false,
  confirmed: false,
  rescheduled: true,
  cancelled: true,
  completed: false,
  no_show: false,
} as const satisfies Record<BookingStatus, boolean>;

export function removesCalendarEvent(status: BookingStatus): boolean {
  return REMOVES_CALENDAR_EVENT[status];
}

// Nadia can create a booking from the admin already confirmed (e.g. a
// session agreed by phone); every other status has to be reached through
// a transition.
const INITIAL_STATUSES: readonly BookingStatus[] = ["pending", "confirmed"];

// Statuses whose meaning depends on work only a use case does: `rescheduled`
// is only true once a replacement booking exists (rescheduleBooking).
const USE_CASE_ONLY_TARGETS: readonly BookingStatus[] = ["rescheduled"];

export type StatusChangeError =
  | TransitionError
  | { kind: "invalid_initial_status"; to: BookingStatus }
  | { kind: "use_case_required"; to: BookingStatus };

/**
 * Guard for every write of `status`, including direct admin edits (the
 * Payload `beforeChange` hook on Bookings calls this). `from: null` means
 * the booking is being created.
 */
export function checkStatusChange(input: {
  from: BookingStatus | null;
  to: BookingStatus;
  viaUseCase: boolean;
}): Result<BookingStatus, StatusChangeError> {
  const { from, to, viaUseCase } = input;
  if (from === null) {
    return INITIAL_STATUSES.includes(to)
      ? { ok: true, value: to }
      : { ok: false, error: { kind: "invalid_initial_status", to } };
  }
  const result = transition(from, to);
  if (!result.ok) return result;
  if (!viaUseCase && USE_CASE_ONLY_TARGETS.includes(to)) {
    return { ok: false, error: { kind: "use_case_required", to } };
  }
  return result;
}
