import { describe, expect, it } from "vitest";
import {
  addDaysToDateString,
  weekdayOfDateString,
  zonedDateString,
  zonedWallTimeToUtc,
  zonedWeekday,
} from "@/lib/dates";

// Europe/Vienna DST transitions used below (EU rule: last Sunday of March /
// October). Confirmed for 2026: spring forward 2026-03-29 (CET +1 -> CEST
// +2), autumn back 2026-10-25 (CEST +2 -> CET +1). The point of these tests
// is that the SAME local wall time maps to a DIFFERENT UTC instant on
// either side of the transition — proof the offset is recomputed per date,
// not hard-coded (ENGINEERING.md §5.1).
describe("zonedWallTimeToUtc", () => {
  it("uses the CET (+1) offset before the spring transition", () => {
    const utc = zonedWallTimeToUtc("2026-03-20", "09:00", "Europe/Vienna");
    expect(utc.toISOString()).toBe("2026-03-20T08:00:00.000Z");
  });

  it("uses the CEST (+2) offset after the spring transition", () => {
    const utc = zonedWallTimeToUtc("2026-04-03", "09:00", "Europe/Vienna");
    expect(utc.toISOString()).toBe("2026-04-03T07:00:00.000Z");
  });

  it("uses the CEST (+2) offset before the autumn transition", () => {
    const utc = zonedWallTimeToUtc("2026-10-16", "09:00", "Europe/Vienna");
    expect(utc.toISOString()).toBe("2026-10-16T07:00:00.000Z");
  });

  it("uses the CET (+1) offset after the autumn transition", () => {
    const utc = zonedWallTimeToUtc("2026-11-02", "09:00", "Europe/Vienna");
    expect(utc.toISOString()).toBe("2026-11-02T08:00:00.000Z");
  });

  it("rejects a date string that isn't yyyy-MM-dd", () => {
    expect(() =>
      zonedWallTimeToUtc("03/20/2026", "09:00", "Europe/Vienna"),
    ).toThrow();
  });
});

describe("zonedDateString", () => {
  it("round-trips a UTC instant back to its local calendar date", () => {
    const utc = zonedWallTimeToUtc("2026-06-15", "09:00", "Europe/Vienna");
    expect(zonedDateString(utc, "Europe/Vienna")).toBe("2026-06-15");
  });

  it("can shift the calendar date near midnight across timezones", () => {
    // 23:30 in Vienna (CEST, +2) on June 15 is 21:30 UTC, still June 15 in
    // UTC too — but late enough that a naive date-only read would be risky.
    const utc = zonedWallTimeToUtc("2026-06-15", "23:30", "Europe/Vienna");
    expect(zonedDateString(utc, "Europe/Vienna")).toBe("2026-06-15");
    expect(zonedDateString(utc, "UTC")).toBe("2026-06-15");
  });
});

describe("zonedWeekday", () => {
  it("returns the correct weekday in the given timezone", () => {
    // 2026-03-20 is a Friday (confirmed against the 2026 calendar).
    const utc = zonedWallTimeToUtc("2026-03-20", "09:00", "Europe/Vienna");
    expect(zonedWeekday(utc, "Europe/Vienna")).toBe("fri");
  });

  it("can disagree with the UTC weekday near a date boundary", () => {
    // 00:30 Vienna time (CET, +1) on 2026-03-30 (a Monday) is 2026-03-29
    // 23:30 UTC (a Sunday) — the business timezone's weekday must win.
    const utc = zonedWallTimeToUtc("2026-03-30", "00:30", "Europe/Vienna");
    expect(zonedWeekday(utc, "Europe/Vienna")).toBe("mon");
    expect(zonedWeekday(utc, "UTC")).toBe("sun");
  });
});

describe("weekdayOfDateString", () => {
  it("returns the correct weekday for a plain calendar date", () => {
    expect(weekdayOfDateString("2026-03-20")).toBe("fri");
    expect(weekdayOfDateString("2026-03-30")).toBe("mon");
  });

  it("rejects a non-yyyy-MM-dd string", () => {
    expect(() => weekdayOfDateString("20-03-2026")).toThrow();
  });
});

describe("addDaysToDateString", () => {
  it("adds days within the same month", () => {
    expect(addDaysToDateString("2026-03-20", 3)).toBe("2026-03-23");
  });

  it("rolls over a month boundary", () => {
    expect(addDaysToDateString("2026-03-30", 3)).toBe("2026-04-02");
  });

  it("rolls over a year boundary", () => {
    expect(addDaysToDateString("2026-12-30", 3)).toBe("2027-01-02");
  });

  it("supports negative offsets", () => {
    expect(addDaysToDateString("2026-03-01", -1)).toBe("2026-02-28");
  });
});
