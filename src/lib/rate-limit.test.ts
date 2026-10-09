import { describe, expect, it } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("allows requests up to the max within the window", () => {
    const key = "test:allows-up-to-max";
    const opts = { max: 3, windowMs: 1000, now: 0 };
    expect(checkRateLimit(key, opts)).toBe(true);
    expect(checkRateLimit(key, opts)).toBe(true);
    expect(checkRateLimit(key, opts)).toBe(true);
  });

  it("rejects once the max is exceeded within the window", () => {
    const key = "test:rejects-over-max";
    const opts = { max: 2, windowMs: 1000, now: 0 };
    expect(checkRateLimit(key, opts)).toBe(true);
    expect(checkRateLimit(key, opts)).toBe(true);
    expect(checkRateLimit(key, opts)).toBe(false);
  });

  it("resets the count once the window has passed", () => {
    const key = "test:resets-after-window";
    expect(checkRateLimit(key, { max: 1, windowMs: 1000, now: 0 })).toBe(true);
    expect(checkRateLimit(key, { max: 1, windowMs: 1000, now: 500 })).toBe(
      false,
    );
    expect(checkRateLimit(key, { max: 1, windowMs: 1000, now: 1500 })).toBe(
      true,
    );
  });

  it("tracks separate keys independently", () => {
    const opts = { max: 1, windowMs: 1000, now: 0 };
    expect(checkRateLimit("test:key-a", opts)).toBe(true);
    expect(checkRateLimit("test:key-b", opts)).toBe(true);
  });
});
