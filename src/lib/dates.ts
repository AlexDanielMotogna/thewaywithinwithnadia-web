import { addDays } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

// The only place IANA timezone conversion and date-string parsing happen
// (ENGINEERING.md §5.1). Everything else deals in UTC `Date` instants or in
// these branded string shapes, never raw `new Date('...')` string parsing.

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

const WEEKDAY_BY_ISO_DAY: Record<string, Weekday> = {
  "1": "mon",
  "2": "tue",
  "3": "wed",
  "4": "thu",
  "5": "fri",
  "6": "sat",
  "7": "sun",
};

const DATE_STRING_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function assertDateString(value: string): void {
  if (!DATE_STRING_PATTERN.test(value)) {
    throw new Error(`Expected a "yyyy-MM-dd" date string, got: ${value}`);
  }
}

/**
 * Converts a local wall-clock date + time in `timezone` to the UTC instant
 * it represents, recomputing the offset for that specific date (DST-safe) —
 * never a fixed offset.
 */
export function zonedWallTimeToUtc(
  dateString: string,
  timeString: string,
  timezone: string,
): Date {
  assertDateString(dateString);
  return fromZonedTime(`${dateString}T${timeString}:00`, timezone);
}

/** The calendar date ("yyyy-MM-dd") `instant` falls on in `timezone`. */
export function zonedDateString(instant: Date, timezone: string): string {
  return formatInTimeZone(instant, timezone, "yyyy-MM-dd");
}

function weekdayFromIsoToken(isoDay: string): Weekday {
  const weekday = WEEKDAY_BY_ISO_DAY[isoDay];
  if (!weekday) {
    throw new Error(`Unexpected ISO weekday token from date-fns-tz: ${isoDay}`);
  }
  return weekday;
}

/** The weekday `instant` falls on in `timezone`. */
export function zonedWeekday(instant: Date, timezone: string): Weekday {
  return weekdayFromIsoToken(formatInTimeZone(instant, timezone, "i"));
}

/**
 * The weekday a plain "yyyy-MM-dd" calendar date falls on. Independent of
 * any timezone — a calendar date is the same weekday everywhere.
 */
export function weekdayOfDateString(dateString: string): Weekday {
  assertDateString(dateString);
  const year = Number(dateString.slice(0, 4));
  const month = Number(dateString.slice(5, 7));
  const day = Number(dateString.slice(8, 10));
  const isoDay = formatInTimeZone(
    new Date(Date.UTC(year, month - 1, day)),
    "UTC",
    "i",
  );
  return weekdayFromIsoToken(isoDay);
}

/** Adds whole calendar days to a "yyyy-MM-dd" string. Pure date-string math. */
export function addDaysToDateString(dateString: string, days: number): string {
  assertDateString(dateString);
  const year = Number(dateString.slice(0, 4));
  const month = Number(dateString.slice(5, 7));
  const day = Number(dateString.slice(8, 10));
  const shifted = addDays(new Date(Date.UTC(year, month - 1, day)), days);
  return shifted.toISOString().slice(0, 10);
}
