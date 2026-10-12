import { addMinutes } from "date-fns";
import {
  addDaysToDateString,
  weekdayOfDateString,
  zonedDateString,
  zonedWallTimeToUtc,
} from "@/lib/dates";
import type {
  DateException,
  Interval,
  Slot,
  WeeklyRule,
} from "@/modules/booking/domain/types";

export interface ComputeAvailableSlotsInput {
  /** The UTC instant range to search. A slot qualifies if its start falls
   *  in [range.from, range.to). */
  range: { from: Date; to: Date };
  /** Injected clock — never read from the system clock here (ENGINEERING.md §5.2). */
  now: Date;
  /** IANA business timezone, e.g. "Europe/Vienna". */
  timezone: string;
  /** Already filtered to `active: true` by the caller. */
  weeklyRules: readonly WeeklyRule[];
  exceptions: readonly DateException[];
  /** Existing bookings + Google free/busy. Each interval is assumed to
   *  already include whatever buffer applies to IT (ENGINEERING.md §5.3's
   *  `blocked_until`) — this function only adds the buffer for the
   *  candidate slot being generated now. */
  busy: readonly Interval[];
  service: { durationMin: number; bufferMin: number };
  minNoticeMin: number;
  stepMin: number;
}

function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

function windowsForDate(
  dateString: string,
  weeklyRules: readonly WeeklyRule[],
  exceptions: readonly DateException[],
  timezone: string,
): Interval[] {
  const exception = exceptions.find((e) => e.date === dateString);
  if (exception?.type === "blocked") return [];

  const weekday = weekdayOfDateString(dateString);
  const windows = weeklyRules
    .filter((rule) => rule.weekday === weekday)
    .map((rule) => ({
      start: zonedWallTimeToUtc(dateString, rule.startTime, timezone),
      end: zonedWallTimeToUtc(dateString, rule.endTime, timezone),
    }));

  if (exception?.type === "extra_hours") {
    windows.push({
      start: zonedWallTimeToUtc(dateString, exception.startTime, timezone),
      end: zonedWallTimeToUtc(dateString, exception.endTime, timezone),
    });
  }

  return windows;
}

function slotsWithinWindow(
  window: Interval,
  durationMin: number,
  bufferMin: number,
  stepMin: number,
): Slot[] {
  const slots: Slot[] = [];
  for (
    let start = window.start;
    addMinutes(addMinutes(start, durationMin), bufferMin) <= window.end;
    start = addMinutes(start, stepMin)
  ) {
    slots.push({ start, end: addMinutes(start, durationMin) });
  }
  return slots;
}

/**
 * Pure function: given availability rules/exceptions/busy intervals for a
 * date range, returns the bookable slots. No I/O, no system clock
 * (ENGINEERING.md §5.2) — fully deterministic and unit-testable.
 */
export function computeAvailableSlots(
  input: ComputeAvailableSlotsInput,
): Slot[] {
  const {
    range,
    now,
    timezone,
    weeklyRules,
    exceptions,
    busy,
    service,
    minNoticeMin,
    stepMin,
  } = input;

  const earliestStart = addMinutes(now, minNoticeMin);
  const slots: Slot[] = [];

  let dateString = zonedDateString(range.from, timezone);
  const lastDateString = zonedDateString(addMinutes(range.to, -1), timezone);

  while (dateString <= lastDateString) {
    const windows = windowsForDate(
      dateString,
      weeklyRules,
      exceptions,
      timezone,
    );
    for (const window of windows) {
      for (const slot of slotsWithinWindow(
        window,
        service.durationMin,
        service.bufferMin,
        stepMin,
      )) {
        if (slot.start < range.from || slot.start >= range.to) continue;
        if (slot.start < earliestStart) continue;

        const committed: Interval = {
          start: slot.start,
          end: addMinutes(slot.end, service.bufferMin),
        };
        if (busy.some((b) => overlaps(committed, b))) continue;

        slots.push(slot);
      }
    }
    dateString = addDaysToDateString(dateString, 1);
  }

  return slots;
}
