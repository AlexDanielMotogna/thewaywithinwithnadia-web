import { describe, expect, it } from "vitest";
import {
  canTransition,
  transition,
} from "@/modules/booking/domain/state-machine";
import type { BookingStatus } from "@/modules/booking/domain/state-machine";

describe("canTransition", () => {
  it("allows pending -> confirmed", () => {
    expect(canTransition("pending", "confirmed")).toBe(true);
  });

  it("allows pending -> cancelled", () => {
    expect(canTransition("pending", "cancelled")).toBe(true);
  });

  it("disallows pending -> completed (must be confirmed first)", () => {
    expect(canTransition("pending", "completed")).toBe(false);
  });

  it("allows every valid transition out of confirmed", () => {
    const targets: BookingStatus[] = [
      "rescheduled",
      "cancelled",
      "completed",
      "no_show",
    ];
    for (const to of targets) {
      expect(canTransition("confirmed", to)).toBe(true);
    }
  });

  it("disallows confirmed -> pending (no going backwards)", () => {
    expect(canTransition("confirmed", "pending")).toBe(false);
  });

  it("disallows any transition out of a terminal state", () => {
    const terminal: BookingStatus[] = [
      "rescheduled",
      "cancelled",
      "completed",
      "no_show",
    ];
    const anyTarget: BookingStatus[] = [
      "pending",
      "confirmed",
      "rescheduled",
      "cancelled",
      "completed",
      "no_show",
    ];
    for (const from of terminal) {
      for (const to of anyTarget) {
        expect(canTransition(from, to)).toBe(false);
      }
    }
  });

  it("disallows transitioning to the same state", () => {
    expect(canTransition("pending", "pending")).toBe(false);
    expect(canTransition("confirmed", "confirmed")).toBe(false);
  });
});

describe("transition", () => {
  it("returns an ok Result with the new status on a valid transition", () => {
    const result = transition("pending", "confirmed");
    expect(result).toEqual({ ok: true, value: "confirmed" });
  });

  it("returns an error Result describing the invalid transition", () => {
    const result = transition("cancelled", "confirmed");
    expect(result).toEqual({
      ok: false,
      error: { kind: "invalid_transition", from: "cancelled", to: "confirmed" },
    });
  });
});
