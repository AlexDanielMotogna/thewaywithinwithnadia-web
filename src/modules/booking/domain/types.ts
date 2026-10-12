import type { Weekday } from "@/lib/dates";

// Pure domain types (ENGINEERING.md §2) — no React/Next/Payload/DB imports.

export interface Interval {
  start: Date;
  end: Date;
}

/** A recurring weekly availability window, in business-local wall time. */
export interface WeeklyRule {
  weekday: Weekday;
  startTime: string; // "HH:mm", local to the business timezone
  endTime: string; // "HH:mm", local to the business timezone
}

/**
 * A one-off override for a single calendar date (business-local).
 * "blocked" removes all availability for that date, regardless of
 * `WeeklyRule`s. "extra_hours" ADDS an extra window on top of whatever the
 * weekly rules already offer that day (it does not replace them) — see
 * `computeAvailableSlots` tests for the exact behaviour this encodes.
 */
export type DateException =
  | { date: string; type: "blocked" }
  | { date: string; type: "extra_hours"; startTime: string; endTime: string };

export type Slot = Interval;
