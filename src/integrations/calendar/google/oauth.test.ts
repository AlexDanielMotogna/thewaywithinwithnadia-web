import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { buildAuthUrl, exchangeCode, hasCalendarScopes, refreshAccessToken } =
  await import("@/integrations/calendar/google/oauth");

const client = {
  clientId: "cid",
  clientSecret: "secret",
  redirectUri: "http://localhost:3000/callback",
};

const respond =
  (status: number, body: unknown): typeof fetch =>
  () =>
    Promise.resolve(new Response(JSON.stringify(body), { status }));

function idToken(claims: object): string {
  return `h.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.s`;
}

describe("Google OAuth", () => {
  it("asks for offline access with least-privilege calendar scopes", () => {
    const url = new URL(buildAuthUrl(client, "state-1"));
    expect(url.searchParams.get("access_type")).toBe("offline");
    expect(url.searchParams.get("prompt")).toBe("consent");
    expect(url.searchParams.get("state")).toBe("state-1");
    const scopes = (url.searchParams.get("scope") ?? "").split(" ");
    expect(scopes).toContain("https://www.googleapis.com/auth/calendar.events");
    expect(scopes).toContain(
      "https://www.googleapis.com/auth/calendar.freebusy",
    );
    // Never the full read/write scope over all of Nadia's calendars.
    expect(scopes).not.toContain("https://www.googleapis.com/auth/calendar");
  });

  it("exchanges a code for a refresh token and reads the account email", async () => {
    const result = await exchangeCode(
      client,
      "code",
      respond(200, {
        access_token: "at",
        expires_in: 3599,
        refresh_token: "rt",
        scope: "openid email https://www.googleapis.com/auth/calendar.events",
        id_token: idToken({ email: "nadia@example.com" }),
      }),
    );
    expect(result).toEqual({
      ok: true,
      value: {
        refreshToken: "rt",
        email: "nadia@example.com",
        grantedScopes: [
          "openid",
          "email",
          "https://www.googleapis.com/auth/calendar.events",
        ],
      },
    });
  });

  it("requires both calendar scopes to count as connected", () => {
    const events = "https://www.googleapis.com/auth/calendar.events";
    const freebusy = "https://www.googleapis.com/auth/calendar.freebusy";
    expect(hasCalendarScopes(["openid", events, freebusy])).toBe(true);
    expect(hasCalendarScopes(["openid", events])).toBe(false);
  });

  it("fails the exchange when Google returns no refresh token", async () => {
    const result = await exchangeCode(
      client,
      "code",
      respond(200, { access_token: "at", expires_in: 3599 }),
    );
    expect(result.ok).toBe(false);
  });

  it("reports a revoked refresh token as revoked, other errors as unavailable", async () => {
    expect(
      await refreshAccessToken(
        client,
        "rt",
        respond(400, { error: "invalid_grant" }),
      ),
    ).toEqual({ ok: false, error: { kind: "revoked" } });
    const other = await refreshAccessToken(client, "rt", respond(500, {}));
    expect(other).toMatchObject({ ok: false, error: { kind: "unavailable" } });
  });

  it("returns the access token and its lifetime", async () => {
    expect(
      await refreshAccessToken(
        client,
        "rt",
        respond(200, { access_token: "at", expires_in: 3599 }),
      ),
    ).toEqual({ ok: true, value: { accessToken: "at", expiresInSec: 3599 } });
  });
});
