import { describe, expect, it } from "vitest";
import { signToken, verifyToken } from "@/lib/signed-token";

const SECRET = "test-payload-secret";
const NOW = new Date("2026-10-28T12:00:00Z");
const LATER = new Date("2026-10-28T12:10:00Z");

describe("signed-token", () => {
  it("verifies its own token before expiry and returns the payload", () => {
    const token = signToken({
      data: "user-1:nonce",
      secret: SECRET,
      purpose: "oauth-state",
      expiresAt: LATER,
    });
    expect(
      verifyToken({ token, secret: SECRET, purpose: "oauth-state", now: NOW }),
    ).toEqual({
      ok: true,
      value: "user-1:nonce",
    });
  });

  it("rejects an expired token", () => {
    const token = signToken({
      data: "d",
      secret: SECRET,
      purpose: "p",
      expiresAt: NOW,
    });
    expect(
      verifyToken({ token, secret: SECRET, purpose: "p", now: LATER }),
    ).toEqual({
      ok: false,
      error: { kind: "expired" },
    });
  });

  it("rejects a token signed for another purpose or with another secret", () => {
    const token = signToken({
      data: "d",
      secret: SECRET,
      purpose: "p",
      expiresAt: LATER,
    });
    expect(
      verifyToken({ token, secret: SECRET, purpose: "other", now: NOW }).ok,
    ).toBe(false);
    expect(
      verifyToken({ token, secret: "other", purpose: "p", now: NOW }).ok,
    ).toBe(false);
  });

  it("rejects a token whose payload was changed", () => {
    const token = signToken({
      data: "user-1",
      secret: SECRET,
      purpose: "p",
      expiresAt: LATER,
    });
    const [, signature] = token.split(".");
    const forged = `${Buffer.from(JSON.stringify({ d: "user-2", exp: LATER.getTime() })).toString("base64url")}.${signature ?? ""}`;
    expect(
      verifyToken({ token: forged, secret: SECRET, purpose: "p", now: NOW }),
    ).toEqual({
      ok: false,
      error: { kind: "invalid" },
    });
  });

  it("rejects malformed input", () => {
    expect(
      verifyToken({ token: "nope", secret: SECRET, purpose: "p", now: NOW }).ok,
    ).toBe(false);
  });
});
