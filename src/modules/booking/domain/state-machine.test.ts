import { describe, expect, it } from "vitest";
import {
  canTransition,
  checkStatusChange,
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

describe("checkStatusChange", () => {
  it("allows creating a booking as pending or confirmed", () => {
    expect(
      checkStatusChange({ from: null, to: "pending", viaUseCase: false }),
    ).toEqual({ ok: true, value: "pending" });
    expect(
      checkStatusChange({ from: null, to: "confirmed", viaUseCase: false }),
    ).toEqual({ ok: true, value: "confirmed" });
  });

  it("rejects creating a booking directly in a later state", () => {
    expect(
      checkStatusChange({ from: null, to: "completed", viaUseCase: false }),
    ).toEqual({
      ok: false,
      error: { kind: "invalid_initial_status", to: "completed" },
    });
  });

  it("rejects an invalid transition even when it comes from a use case", () => {
    expect(
      checkStatusChange({
        from: "cancelled",
        to: "confirmed",
        viaUseCase: true,
      }),
    ).toEqual({
      ok: false,
      error: { kind: "invalid_transition", from: "cancelled", to: "confirmed" },
    });
  });

  it("allows simple admin transitions without a use case", () => {
    expect(
      checkStatusChange({
        from: "pending",
        to: "confirmed",
        viaUseCase: false,
      }),
    ).toEqual({ ok: true, value: "confirmed" });
    expect(
      checkStatusChange({
        from: "confirmed",
        to: "no_show",
        viaUseCase: false,
      }),
    ).toEqual({ ok: true, value: "no_show" });
  });

  it("only lets the reschedule use case set rescheduled (it needs a replacement booking)", () => {
    expect(
      checkStatusChange({
        from: "confirmed",
        to: "rescheduled",
        viaUseCase: false,
      }),
    ).toEqual({
      ok: false,
      error: { kind: "use_case_required", to: "rescheduled" },
    });
    expect(
      checkStatusChange({
        from: "confirmed",
        to: "rescheduled",
        viaUseCase: true,
      }),
    ).toEqual({ ok: true, value: "rescheduled" });
  });
});
