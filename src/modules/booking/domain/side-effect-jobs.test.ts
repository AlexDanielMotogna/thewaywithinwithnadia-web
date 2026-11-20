import { describe, expect, it } from "vitest";
import { jobsForBookingChange } from "@/modules/booking/domain/side-effect-jobs";

describe("jobsForBookingChange — created", () => {
  it("syncs a booking made on the website and tells Nadia about it", () => {
    expect(
      jobsForBookingChange({
        change: { kind: "created" },
        status: "confirmed",
        hasCalendarEvent: false,
        byOwner: false,
      }),
    ).toEqual([{ task: "processBookingSideEffects", notifyOwner: true }]);
  });

  it("syncs a booking Nadia created in the admin without emailing her about it", () => {
    expect(
      jobsForBookingChange({
        change: { kind: "created" },
        status: "confirmed",
        hasCalendarEvent: false,
        byOwner: true,
      }),
    ).toEqual([{ task: "processBookingSideEffects", notifyOwner: false }]);
  });
});

describe("jobsForBookingChange — updated", () => {
  it("removes the event and emails on a cancellation from the website", () => {
    expect(
      jobsForBookingChange({
        change: { kind: "updated", from: "confirmed" },
        status: "cancelled",
        hasCalendarEvent: true,
        byOwner: false,
      }),
    ).toEqual([
      { task: "removeBookingCalendarEvent" },
      { task: "notifyBookingCancelled", notifyOwner: true },
    ]);
  });

  it("does not email Nadia about a cancellation she made in the admin", () => {
    expect(
      jobsForBookingChange({
        change: { kind: "updated", from: "pending" },
        status: "cancelled",
        hasCalendarEvent: true,
        byOwner: true,
      }),
    ).toEqual([
      { task: "removeBookingCalendarEvent" },
      { task: "notifyBookingCancelled", notifyOwner: false },
    ]);
  });

  it("still emails the cancellation when the event was never created", () => {
    expect(
      jobsForBookingChange({
        change: { kind: "updated", from: "confirmed" },
        status: "cancelled",
        hasCalendarEvent: false,
        byOwner: false,
      }),
    ).toEqual([{ task: "notifyBookingCancelled", notifyOwner: true }]);
  });

  it("removes the old event on a reschedule without a cancellation email", () => {
    expect(
      jobsForBookingChange({
        change: { kind: "updated", from: "confirmed" },
        status: "rescheduled",
        hasCalendarEvent: true,
        byOwner: false,
      }),
    ).toEqual([{ task: "removeBookingCalendarEvent" }]);
  });

  it.each(["completed", "no_show"] as const)(
    "keeps the calendar event when Nadia marks a session %s",
    (status) => {
      expect(
        jobsForBookingChange({
          change: { kind: "updated", from: "confirmed" },
          status,
          hasCalendarEvent: true,
          byOwner: true,
        }),
      ).toEqual([]);
    },
  );

  it("does nothing on an edit that does not change the status", () => {
    expect(
      jobsForBookingChange({
        change: { kind: "updated", from: "confirmed" },
        status: "confirmed",
        hasCalendarEvent: true,
        byOwner: true,
      }),
    ).toEqual([]);
  });
});

describe("jobsForBookingChange — deleted", () => {
  it("removes the calendar event of a deleted booking, without emails", () => {
    expect(
      jobsForBookingChange({
        change: { kind: "deleted" },
        status: "confirmed",
        hasCalendarEvent: true,
        byOwner: true,
      }),
    ).toEqual([{ task: "removeBookingCalendarEvent" }]);
  });

  it("does nothing when the deleted booking had no event left", () => {
    expect(
      jobsForBookingChange({
        change: { kind: "deleted" },
        status: "cancelled",
        hasCalendarEvent: false,
        byOwner: true,
      }),
    ).toEqual([]);
  });
});
