import "server-only";
import config from "@payload-config";
import { addMinutes } from "date-fns";
import { getPayload } from "payload";
import { zonedDateString } from "@/lib/dates";
import type {
  DateException,
  Interval,
  WeeklyRule,
} from "@/modules/booking/domain/types";

export interface AvailabilityContext {
  weeklyRules: WeeklyRule[];
  exceptions: DateException[];
  busy: Interval[];
}

/**
 * Loads everything `computeAvailableSlots` (pure, ENGINEERING.md §5.2)
 * needs, for a given search range. Busy intervals are derived from each
 * booking's own snapshot fields (`startsAt`/`durationMin`/`bufferMin`), not
 * the DB-only `blocked_until` trigger column — Payload doesn't know about
 * that column, it only backs the exclusion constraint itself.
 */
export async function loadAvailabilityContext(input: {
  range: { from: Date; to: Date };
  timezone: string;
}): Promise<AvailabilityContext> {
  const payload = await getPayload({ config });

  const [rulesResult, exceptionsResult, bookingsResult] = await Promise.all([
    payload.find({
      collection: "availability-rules",
      where: { active: { equals: true } },
      limit: 0,
    }),
    payload.find({ collection: "availability-exceptions", limit: 0 }),
    payload.find({
      collection: "bookings",
      where: {
        and: [
          { status: { in: ["pending", "confirmed"] } },
          { startsAt: { less_than: input.range.to.toISOString() } },
        ],
      },
      limit: 0,
    }),
  ]);

  const weeklyRules: WeeklyRule[] = rulesResult.docs.map((rule) => ({
    weekday: rule.weekday,
    startTime: rule.startTime,
    endTime: rule.endTime,
  }));

  const exceptions: DateException[] = exceptionsResult.docs.map((exception) => {
    const dateString = zonedDateString(
      new Date(exception.date),
      input.timezone,
    );
    if (exception.type === "extra_hours") {
      if (!exception.startTime || !exception.endTime) {
        throw new Error(
          `AvailabilityException ${String(exception.id)} is 'extra_hours' but missing startTime/endTime`,
        );
      }
      return {
        date: dateString,
        type: "extra_hours",
        startTime: exception.startTime,
        endTime: exception.endTime,
      };
    }
    return { date: dateString, type: "blocked" };
  });

  const busy: Interval[] = bookingsResult.docs.map((booking) => {
    const start = new Date(booking.startsAt);
    return {
      start,
      end: addMinutes(start, booking.durationMin + booking.bufferMin),
    };
  });

  return { weeklyRules, exceptions, busy };
}
