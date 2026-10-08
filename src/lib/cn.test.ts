import { describe, expect, it } from "vitest";
import { cn } from "@/lib/cn";

describe("cn", () => {
  it("merges class lists and drops falsy values", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b");
  });

  it("resolves conflicting Tailwind classes to the last one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
