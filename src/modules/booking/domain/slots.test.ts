import { describe, expect, it } from "vitest";
import { zonedWallTimeToUtc } from "@/lib/dates";
import { computeAvailableSlots } from "@/modules/booking/domain/slots";
import type {
  DateException,
  Interval,
  WeeklyRule,
} from "@/modules/booking/domain/types";

const TZ = "Europe/Vienna";

function at(dateString: string, timeString: string): Date {
  return zonedWallTimeToUtc(dateString, timeString, TZ);
}

function dayRange(dateString: string): { from: Date; to: Date } {
  return {
    from: at(dateString, "00:00"),
    to: zonedWallTimeToUtc(
      // next day, computed by hand for these fixed test dates — kept local
      // to this helper, never reused as a general-purpose date util.
      dateString === "2026-03-20" ? "2026-03-21" : "2026-04-04",
      "00:00",
      TZ,
    ),
  };
}

const FRI_09_10: WeeklyRule = {
  weekday: "fri",
  startTime: "09:00",
  endTime: "10:00",
};
const LONG_BEFORE = at("2026-01-01", "00:00");

describe("computeAvailableSlots", () => {
  it("returns a single slot that exactly fills a one-hour window", () => {
    const slots = computeAvailableSlots({
      range: dayRange("2026-03-20"),
      now: LONG_BEFORE,
      timezone: TZ,
      weeklyRules: [FRI_09_10],
      exceptions: [],
      busy: [],
      service: { durationMin: 60, bufferMin: 0 },
      minNoticeMin: 0,
      stepMin: 30,
    });

    expect(slots).toEqual([
      { start: at("2026-03-20", "09:00"), end: at("2026-03-20", "10:00") },
    ]);
  });

  it("excludes a candidate that would run past the end of the window (end-of-day edge)", () => {
    const slots = computeAvailableSlots({
      range: dayRange("2026-03-20"),
      now: LONG_BEFORE,
      timezone: TZ,
      weeklyRules: [FRI_09_10],
      exceptions: [],
      busy: [],
      service: { durationMin: 60, bufferMin: 0 },
      minNoticeMin: 0,
      stepMin: 15,
    });

    // 09:15 would end at 10:15, past the 10:00 window end — only 09:00 fits.
    expect(slots).toHaveLength(1);
    expect(slots[0]?.start).toEqual(at("2026-03-20", "09:00"));
  });

  it("steps through a window at the configured granularity", () => {
    const slots = computeAvailableSlots({
      range: dayRange("2026-03-20"),
      now: LONG_BEFORE,
      timezone: TZ,
      weeklyRules: [{ weekday: "fri", startTime: "09:00", endTime: "11:00" }],
      exceptions: [],
      busy: [],
      service: { durationMin: 30, bufferMin: 0 },
      minNoticeMin: 0,
      stepMin: 30,
    });

    expect(slots.map((s) => s.start)).toEqual([
      at("2026-03-20", "09:00"),
      at("2026-03-20", "09:30"),
      at("2026-03-20", "10:00"),
      at("2026-03-20", "10:30"),
    ]);
  });

  it("filters out slots inside the minimum-notice window", () => {
    const slots = computeAvailableSlots({
      range: dayRange("2026-03-20"),
      now: at("2026-03-20", "08:00"),
      timezone: TZ,
      weeklyRules: [{ weekday: "fri", startTime: "09:00", endTime: "11:00" }],
      exceptions: [],
      busy: [],
      service: { durationMin: 30, bufferMin: 0 },
      minNoticeMin: 90, // earliest allowed start: 09:30
      stepMin: 30,
    });

    expect(slots.map((s) => s.start)).toEqual([
      at("2026-03-20", "09:30"),
      at("2026-03-20", "10:00"),
      at("2026-03-20", "10:30"),
    ]);
  });

  it("excludes every slot when duration + buffer doesn't fit the window", () => {
    const slots = computeAvailableSlots({
      range: dayRange("2026-03-20"),
      now: LONG_BEFORE,
      timezone: TZ,
      weeklyRules: [FRI_09_10], // 60-minute window
      exceptions: [],
      busy: [],
      service: { durationMin: 60, bufferMin: 15 }, // needs 75 minutes
      minNoticeMin: 0,
      stepMin: 30,
    });

    expect(slots).toEqual([]);
  });

  it("accounts for the buffer when deciding which candidates fit", () => {
    const slots = computeAvailableSlots({
      range: dayRange("2026-03-20"),
      now: LONG_BEFORE,
      timezone: TZ,
      weeklyRules: [{ weekday: "fri", startTime: "09:00", endTime: "11:00" }],
      exceptions: [],
      busy: [],
      service: { durationMin: 45, bufferMin: 15 }, // 60-minute committed span
      minNoticeMin: 0,
      stepMin: 30,
    });

    // 10:30 would commit through 11:30 (45 + 15), past the 11:00 window end.
    expect(slots.map((s) => s.start)).toEqual([
      at("2026-03-20", "09:00"),
      at("2026-03-20", "09:30"),
      at("2026-03-20", "10:00"),
    ]);
  });

  it("removes all availability on a date with a 'blocked' exception", () => {
    const exceptions: DateException[] = [
      { date: "2026-03-20", type: "blocked" },
    ];
    const slots = computeAvailableSlots({
      range: dayRange("2026-03-20"),
      now: LONG_BEFORE,
      timezone: TZ,
      weeklyRules: [FRI_09_10],
      exceptions,
      busy: [],
      service: { durationMin: 60, bufferMin: 0 },
      minNoticeMin: 0,
      stepMin: 30,
    });

    expect(slots).toEqual([]);
  });

  it("adds an 'extra_hours' exception window on top of the regular weekly window", () => {
    const exceptions: DateException[] = [
      {
        date: "2026-03-20",
        type: "extra_hours",
        startTime: "14:00",
        endTime: "15:00",
      },
    ];
    const slots = computeAvailableSlots({
      range: dayRange("2026-03-20"),
      now: LONG_BEFORE,
      timezone: TZ,
      weeklyRules: [FRI_09_10],
      exceptions,
      busy: [],
      service: { durationMin: 60, bufferMin: 0 },
      minNoticeMin: 0,
      stepMin: 30,
    });

    expect(slots.map((s) => s.start)).toEqual([
      at("2026-03-20", "09:00"),
      at("2026-03-20", "14:00"),
    ]);
  });

  it("excludes candidates overlapping an existing busy interval, including touching boundaries", () => {
    const busy: Interval[] = [
      { start: at("2026-03-20", "10:00"), end: at("2026-03-20", "11:00") },
    ];
    const slots = computeAvailableSlots({
      range: dayRange("2026-03-20"),
      now: LONG_BEFORE,
      timezone: TZ,
      weeklyRules: [{ weekday: "fri", startTime: "09:00", endTime: "13:00" }],
      exceptions: [],
      busy,
      service: { durationMin: 30, bufferMin: 0 },
      minNoticeMin: 0,
      stepMin: 30,
    });

    expect(slots.map((s) => s.start)).toEqual([
      at("2026-03-20", "09:00"),
      at("2026-03-20", "09:30"),
      at("2026-03-20", "11:00"),
      at("2026-03-20", "11:30"),
      at("2026-03-20", "12:00"),
      at("2026-03-20", "12:30"),
    ]);
  });

  it("computes the correct UTC instant across the spring DST transition", () => {
    const before = computeAvailableSlots({
      range: dayRange("2026-03-20"),
      now: LONG_BEFORE,
      timezone: TZ,
      weeklyRules: [FRI_09_10],
      exceptions: [],
      busy: [],
      service: { durationMin: 60, bufferMin: 0 },
      minNoticeMin: 0,
      stepMin: 30,
    });
    const after = computeAvailableSlots({
      range: dayRange("2026-04-03"),
      now: LONG_BEFORE,
      timezone: TZ,
      weeklyRules: [FRI_09_10],
      exceptions: [],
      busy: [],
      service: { durationMin: 60, bufferMin: 0 },
      minNoticeMin: 0,
      stepMin: 30,
    });

    expect(before[0]?.start.toISOString()).toBe("2026-03-20T08:00:00.000Z");
    expect(after[0]?.start.toISOString()).toBe("2026-04-03T07:00:00.000Z");
  });
});
