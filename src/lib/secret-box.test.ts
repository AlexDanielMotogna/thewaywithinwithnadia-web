import { describe, expect, it } from "vitest";
import { openSecret, sealSecret } from "@/lib/secret-box";

const SECRET = "test-payload-secret";

describe("secret-box", () => {
  it("round-trips a value", () => {
    const sealed = sealSecret("refresh-token-123", SECRET, "google-refresh");
    expect(sealed).not.toContain("refresh-token-123");
    expect(openSecret(sealed, SECRET, "google-refresh")).toEqual({
      ok: true,
      value: "refresh-token-123",
    });
  });

  it("produces a different ciphertext each time (random IV)", () => {
    expect(sealSecret("x", SECRET, "p")).not.toBe(sealSecret("x", SECRET, "p"));
  });

  it("rejects the wrong secret or purpose", () => {
    const sealed = sealSecret("value", SECRET, "google-refresh");
    expect(openSecret(sealed, "other-secret", "google-refresh").ok).toBe(false);
    expect(openSecret(sealed, SECRET, "other-purpose").ok).toBe(false);
  });

  it("rejects tampered or malformed input", () => {
    const sealed = sealSecret("value", SECRET, "p");
    const parts = sealed.split(".");
    const last = parts[3] ?? "";
    const tampered = [
      ...parts.slice(0, 3),
      (last.startsWith("A") ? "B" : "A") + last.slice(1),
    ].join(".");
    expect(openSecret(tampered, SECRET, "p").ok).toBe(false);
    expect(openSecret("garbage", SECRET, "p").ok).toBe(false);
  });
});
